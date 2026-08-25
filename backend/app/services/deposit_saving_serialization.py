def rate(value):
    return None if value is None else f"{value:.4f}"


def iso(value):
    if value is None:
        return None
    result = value.isoformat()
    return result + "Z" if hasattr(value, "hour") and value.tzinfo is None else result


def condition(item):
    return {"condition_id": item.condition_id, "condition_name": item.condition_name,
            "description": getattr(item, "description", None),
            "additional_interest_rate": rate(item.additional_interest_rate)}


def option(item, include_conditions=False):
    data = {"option_id": item.option_id, "term_months": item.term_months,
            "base_interest_rate": rate(item.base_interest_rate),
            "max_interest_rate": rate(item.max_interest_rate),
            "interest_method": item.interest_method, "min_amount": item.min_amount,
            "max_amount": item.max_amount, "is_active": item.is_active}
    if include_conditions:
        data["preference_conditions"] = [condition(x) for x in item.preference_conditions if x.is_active]
    return data


def product(item, include_conditions=False):
    return {"product_id": item.product_id, "bank_name": item.bank_name,
            "product_name": item.product_name, "product_type": item.product_type,
            "description": item.description, "join_target": item.join_target,
            "is_active": item.is_active,
            "options": [option(x, include_conditions) for x in sorted(item.options, key=lambda x: x.term_months)]}


def snapshots(items):
    return [{"condition_id": x.condition_id, "condition_name": x.condition_name,
             "additional_interest_rate": rate(x.additional_interest_rate)} for x in items]


def _termination_detail(item):
    return {"selected_conditions": snapshots(item.preference_conditions),
            "gross_interest": item.gross_interest, "tax_rate": rate(item.tax_rate),
            "tax_amount": item.tax_amount, "net_interest": item.net_interest,
            "payout_amount": item.payout_amount,
            "applied_early_termination_rate": rate(item.applied_early_termination_rate),
            "matured_at": iso(item.matured_at), "terminated_at": iso(item.terminated_at)}


def deposit(item, detail=False):
    data = {"deposit_id": item.deposit_id, "product_id": item.product_id,
            "option_id": item.option_id, "bank_name": item.product.bank_name,
            "product_name": item.product.product_name, "term_months": item.option.term_months,
            "principal": item.principal, "applied_interest_rate": rate(item.applied_interest_rate),
            "interest_method": item.interest_method, "start_date": iso(item.start_date),
            "maturity_date": iso(item.maturity_date), "status": item.status}
    if detail:
        data.update(_termination_detail(item))
    return data


def payment(item):
    return {"payment_id": item.payment_id, "payment_sequence": item.payment_sequence,
            "payment_year_month": item.payment_year_month, "scheduled_date": iso(item.scheduled_date),
            "amount": item.amount, "status": item.status, "processed_at": iso(item.processed_at)}


def saving(item, detail=False):
    paid = sum(1 for x in item.payments if x.status == "PAID")
    missed = sum(1 for x in item.payments if x.status == "MISSED")
    data = {"saving_id": item.saving_id, "product_id": item.product_id,
            "option_id": item.option_id, "bank_name": item.product.bank_name,
            "product_name": item.product.product_name, "term_months": item.option.term_months,
            "monthly_amount": item.monthly_amount, "scheduled_payment_count": item.scheduled_payment_count,
            "paid_count": paid, "missed_count": missed,
            "total_paid_principal": item.total_paid_principal,
            "applied_interest_rate": rate(item.applied_interest_rate),
            "interest_method": item.interest_method, "payment_day": item.payment_day,
            "next_payment_date": iso(item.next_payment_date), "start_date": iso(item.start_date),
            "maturity_date": iso(item.maturity_date), "status": item.status}
    if detail:
        data.update(_termination_detail(item))
    return data
