from app.extensions import db

from app.services.account_service import (
    get_account_by_user_id,
    debit
)

from app.services.ledger_service import create_ledger

from app.errors.exceptions import BusinessException

from app.constants import (
    TransactionType,
    EntryType
)


def process_auto_transfer(
    user_id,
    amount,
    reference_type,
    reference_id=None
):
    account = get_account_by_user_id(user_id)

    try:
        debit(
            account=account,
            amount=amount
        )

        create_ledger(
            account=account,
            transaction_type=TransactionType.SAVING_PAYMENT.value,
            amount=amount,
            entry_type=EntryType.DEBIT.value,
            reference_type=reference_type,
            reference_id=reference_id
        )

        db.session.commit()

        return {
            "success": True,
            "status": "PROCESSED",
            "account": account
        }

    except BusinessException as error:
        db.session.rollback()

        if error.code == "INSUFFICIENT_BALANCE":
            return {
                "success": False,
                "status": "MISSED",
                "reason": "INSUFFICIENT_BALANCE"
            }

        raise

    except Exception:
        db.session.rollback()
        raise