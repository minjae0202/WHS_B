from flask import Blueprint, request
from app.models.simulation_setting import SimulationSetting
from app.errors.exceptions import BusinessException

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.schemas.simulation_schema import (
    InitialAssetSchema,
    SimulationSettingsSchema
)

from app.services.simulation_service import (
    set_initial_asset,
    update_simulation_settings,
    reset_simulation_data
)


simulation_bp = Blueprint(
    "simulation",
    __name__,
    url_prefix="/api/simulation"
)


initial_asset_schema = InitialAssetSchema()
simulation_settings_schema = SimulationSettingsSchema()


@simulation_bp.post("/initial-asset")
@jwt_required()
def create_initial_asset():
    data = initial_asset_schema.load(
        request.get_json(silent=True) or {}
    )

    user_id = int(get_jwt_identity())

    account, setting = set_initial_asset(
        user_id=user_id,
        initial_asset=data["initial_asset"]
    )

    return {
        "success": True,
        "data": {
            "account_id": account.account_id,
            "balance": account.balance,
            "initial_asset": setting.initial_asset
        },
        "message": "초기 자산이 설정되었습니다."
    }, 200


@simulation_bp.patch("/settings")
@jwt_required()
def update_settings():
    data = simulation_settings_schema.load(
        request.get_json(silent=True) or {}
    )

    user_id = int(get_jwt_identity())

    setting = update_simulation_settings(
        user_id=user_id,
        monthly_income=data["monthly_income"],
        monthly_expense=data["monthly_expense"]
    )

    return {
        "success": True,
        "data": {
            "monthly_income": setting.monthly_income,
            "monthly_expense": setting.monthly_expense
        },
        "message": "시뮬레이션 설정이 수정되었습니다."
    }, 200

@simulation_bp.get("/settings")
@jwt_required()
def get_settings():
    user_id = int(get_jwt_identity())

    setting = SimulationSetting.query.filter_by(
        user_id=user_id
    ).first()

    if setting is None:
        raise BusinessException(
            code="SIMULATION_SETTING_NOT_FOUND",
            message="시뮬레이션 설정을 찾을 수 없습니다.",
            status_code=404
        )

    return {
        "success": True,
        "data": {
            "initial_asset": setting.initial_asset,
            "is_initial_asset_set": setting.is_initial_asset_set,
            "monthly_income": setting.monthly_income,
            "monthly_expense": setting.monthly_expense
        }
    }, 200

@simulation_bp.delete("/reset")
@jwt_required()
def reset_simulation():
    user_id = int(get_jwt_identity())

    account, setting = reset_simulation_data(
        user_id=user_id
    )

    return {
        "success": True,
        "data": {
            "balance": account.balance,
            "initial_asset": setting.initial_asset,
            "is_initial_asset_set": setting.is_initial_asset_set,
            "monthly_income": setting.monthly_income,
            "monthly_expense": setting.monthly_expense
        },
        "message": "시뮬레이션 데이터가 초기화되었습니다."
    }, 200