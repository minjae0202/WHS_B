from flask import Blueprint, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.monthly_income_service import pay_monthly_income


monthly_income_bp = Blueprint(
    "monthly_income",
    __name__,
    url_prefix="/api/monthly-income"
)


@monthly_income_bp.post("/pay")
@jwt_required()
def pay_income():
    data = request.get_json(silent=True) or {}

    year_month = data.get("year_month")

    user_id = int(get_jwt_identity())

    account, cash_flow = pay_monthly_income(
        user_id=user_id,
        year_month=year_month
    )

    return {
        "success": True,
        "data": {
            "monthly_cash_flow_id": cash_flow.monthly_cash_flow_id,
            "year_month": cash_flow.year_month,
            "income_amount": cash_flow.income_amount,
            "balance": account.balance,
            "status": cash_flow.status
        },
        "message": "월 정기 수입이 지급되었습니다."
    }, 200