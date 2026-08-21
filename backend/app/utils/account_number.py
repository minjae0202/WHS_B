import secrets

from app.constants import ErrorCode
from app.errors.exceptions import BusinessException
from app.models.account import Account


def generate_account_number():
    for _ in range(100):
        account_number = (
            f"{secrets.randbelow(10**12):012d}"
        )

        existing_account = (
            Account.query.filter_by(
                account_number=account_number
            ).first()
        )

        if existing_account is None:
            return account_number

    raise BusinessException(
        code=ErrorCode.INTERNAL_SERVER_ERROR,
        message="서버 내부 오류가 발생했습니다.",
        status_code=500
    )