from app.errors.exceptions import BusinessException
from app.models.account import Account


def get_account_by_user_id(user_id):
    account = Account.query.filter_by(user_id=user_id).with_for_update().first()
    if account is None:
        raise BusinessException(code="ACCOUNT_NOT_FOUND", message="가상 계좌를 찾을 수 없습니다.", status_code=404)
    return account


def debit(account, amount):
    if amount <= 0:
        raise BusinessException(code="INVALID_AMOUNT", message="금액은 0보다 커야 합니다.", status_code=422)
    if account.balance < amount:
        raise BusinessException(code="INSUFFICIENT_BALANCE", message="계좌 잔액이 부족합니다.", status_code=422)
    account.balance -= amount


def credit(account, amount):
    if amount <= 0:
        raise BusinessException(code="INVALID_AMOUNT", message="금액은 0보다 커야 합니다.", status_code=422)
    account.balance += amount
