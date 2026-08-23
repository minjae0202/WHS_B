from flask import Blueprint, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.account_service import get_account_by_user_id


account_bp = Blueprint(
    "account",
    __name__,
    url_prefix="/api/accounts"
)


@account_bp.get("/me")
@jwt_required()
def get_my_account():
    user_id = int(get_jwt_identity())

    account = get_account_by_user_id(user_id)

    return jsonify({
        "success": True,
        "data": {
            "account_id": account.account_id,
            "user_id": account.user_id,
            "account_number": account.account_number,
            "balance": account.balance,
            "currency": "KRW"
        }
    }), 200