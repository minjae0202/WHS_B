from datetime import date, datetime
from decimal import Decimal

from app.constants import EntryType, TransactionType
from app.errors.exceptions import BusinessException
from app.extensions import db
from app.models.deposits_savings import (Deposit, DepositPreferenceCondition,
                                         EarlyTerminationRateRule)
from app.services import product_service
from app.services.account_service import credit, debit, get_account_by_user_id
from app.services.deposit_saving_calculations import (GENERAL_TAX_RATE, add_months,
    calculate_applied_rate, calculate_deposit_result, calculate_deposit_termination)
from app.services.deposit_saving_serialization import condition, deposit, rate
from app.services.ledger_service import create_ledger


def simulate(payload):
    option = product_service.get_option(payload["option_id"], "DEPOSIT")
    product_service.validate_amount(payload["principal"], option, "예치 원금")
    conditions = product_service.get_conditions(option.option_id, payload["selected_condition_ids"])
    applied = calculate_applied_rate(option, conditions)
    start, maturity = date.today(), add_months(date.today(), option.term_months)
    return {"option_id": option.option_id, "principal": payload["principal"],
            "term_months": option.term_months, "base_interest_rate": rate(option.base_interest_rate),
            "preference_interest_rate": rate(sum((x.additional_interest_rate for x in conditions), Decimal("0"))),
            "applied_interest_rate": rate(applied), "interest_method": option.interest_method,
            "selected_conditions": [condition(x) for x in conditions],
            **calculate_deposit_result(payload["principal"], applied, start, maturity,
                                       option.interest_method)}


def create(user_id, payload):
    option = product_service.get_option(payload["option_id"], "DEPOSIT", True)
    product_service.validate_amount(payload["principal"], option, "예치 원금")
    conditions = product_service.get_conditions(option.option_id, payload["selected_condition_ids"])
    try:
        account = get_account_by_user_id(user_id)
        start = date.today()
        item = Deposit(user_id=user_id, product_id=option.product_id, option_id=option.option_id,
                       principal=payload["principal"], applied_interest_rate=calculate_applied_rate(option, conditions),
                       interest_method=option.interest_method, start_date=start,
                       maturity_date=add_months(start, option.term_months), status="ACTIVE")
        db.session.add(item); db.session.flush()
        for x in conditions:
            db.session.add(DepositPreferenceCondition(deposit_id=item.deposit_id, condition_id=x.condition_id,
                           condition_name=x.condition_name, additional_interest_rate=x.additional_interest_rate))
        debit(account, item.principal)
        create_ledger(
            account=account,
            transaction_type=TransactionType.DEPOSIT_JOIN.value,
            amount=item.principal,
            entry_type=EntryType.DEBIT.value,
            reference_type="DEPOSIT",
            reference_id=item.deposit_id,
        )
        db.session.commit()
        return deposit(item, True)
    except Exception:
        db.session.rollback(); raise


def get_list(user_id, filters):
    query = Deposit.query.filter_by(user_id=user_id)
    if filters.get("status"): query = query.filter_by(status=filters["status"])
    page = query.order_by(Deposit.created_at.desc()).paginate(page=filters["page"], per_page=filters["size"], error_out=False)
    return {"items": [deposit(x) for x in page.items], "page": filters["page"],
            "size": filters["size"], "total_count": page.total}


def get_detail(user_id, deposit_id):
    item = Deposit.query.filter_by(user_id=user_id, deposit_id=deposit_id).first()
    if item is None:
        raise BusinessException(code="DEPOSIT_NOT_FOUND", message="예금을 찾을 수 없습니다.", status_code=404)
    return deposit(item, True)


def terminate(user_id, deposit_id):
    try:
        item = Deposit.query.filter_by(user_id=user_id, deposit_id=deposit_id).with_for_update().first()
        if item is None: raise BusinessException(code="DEPOSIT_NOT_FOUND", message="예금을 찾을 수 없습니다.", status_code=404)
        if item.status == "MATURED": raise BusinessException(code="DEPOSIT_ALREADY_MATURED", message="이미 만기 처리된 예금입니다.", status_code=409)
        if item.status == "TERMINATED": raise BusinessException(code="DEPOSIT_ALREADY_TERMINATED", message="이미 중도해지된 예금입니다.", status_code=409)
        account = get_account_by_user_id(user_id)
        days = max((date.today() - item.start_date).days, 0)
        rule = EarlyTerminationRateRule.query.filter(
            EarlyTerminationRateRule.option_id == item.option_id,
            EarlyTerminationRateRule.minimum_holding_days <= days,
            db.or_(EarlyTerminationRateRule.maximum_holding_days.is_(None), EarlyTerminationRateRule.maximum_holding_days >= days)
        ).order_by(EarlyTerminationRateRule.minimum_holding_days.desc()).first()
        if rule is None: raise BusinessException(code="EARLY_TERMINATION_RULE_NOT_FOUND", message="중도해지 이율 규칙을 찾을 수 없습니다.", status_code=422)
        result = calculate_deposit_termination(item, item.option, rule, date.today())
        item.status="TERMINATED"; item.applied_early_termination_rate=result["applied_rate"]
        item.gross_interest=result["gross_interest"]; item.tax_rate=GENERAL_TAX_RATE
        item.tax_amount=result["tax_amount"]; item.net_interest=result["net_interest"]
        item.payout_amount=result["payout_amount"]; item.terminated_at=datetime.utcnow()
        credit(account, result["payout_amount"])
        create_ledger(
            account=account,
            transaction_type=TransactionType.DEPOSIT_CANCEL.value,
            amount=result["payout_amount"],
            entry_type=EntryType.CREDIT.value,
            reference_type="DEPOSIT",
            reference_id=item.deposit_id,
        )
        db.session.commit(); return deposit(item, True)
    except Exception:
        db.session.rollback(); raise
