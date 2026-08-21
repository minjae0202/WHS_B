from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from app.schemas.auth import (
    PasswordChangeSchema,
    WithdrawSchema,
)
from app.services import user_service


users_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users",
)


@users_bp.patch("/me/password")
@jwt_required()
def change_password():
    payload = PasswordChangeSchema().load(
        request.get_json(silent=True) or {}
    )

    user_id = int(
        get_jwt_identity()
    )

    user_service.change_password(
        user_id=user_id,
        current_password=payload[
            "current_password"
        ],
        new_password=payload[
            "new_password"
        ],
    )

    return jsonify({
        "success": True,
        "data": {},
        "message": "비밀번호 변경에 성공했습니다.",
    }), 200


@users_bp.delete("/me")
@jwt_required()
def withdraw():
    payload = WithdrawSchema().load(
        request.get_json(silent=True) or {}
    )

    user_id = int(
        get_jwt_identity()
    )

    user_service.withdraw_user(
        user_id=user_id,
        current_password=payload.get(
            "current_password"
        ),
        provider=payload.get(
            "provider"
        ),
        code=payload.get(
            "code"
        ),
    )

    return jsonify({
        "success": True,
        "data": {},
        "message": "회원 탈퇴에 성공했습니다.",
    }), 200