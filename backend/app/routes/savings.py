from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from app.errors.exceptions import BusinessException
from app.schemas.deposits_savings import ContractListQuerySchema, PaymentListQuerySchema, SavingRequestSchema
from app.services import saving_service

savings_bp = Blueprint("savings", __name__, url_prefix="/api/savings")


def _body():
    value = request.get_json(silent=True)
    if not isinstance(value, dict): raise BusinessException(code="INVALID_REQUEST", message="JSON 객체 형식의 요청 본문이 필요합니다.", status_code=400)
    day = value.get("payment_day")
    if type(day) is int and not 1 <= day <= 28: raise BusinessException(code="INVALID_PAYMENT_DAY", message="자동이체일은 1~28이어야 합니다.", status_code=422)
    return SavingRequestSchema().load(value)


def _success(data, status=200):
    return jsonify({"success": True, "data": data, "message": "요청이 성공했습니다."}), status


def _filters(schema, status_code):
    try: return schema.load(request.args)
    except ValidationError as error:
        if "status" in error.messages: raise BusinessException(code=status_code, message="지원하지 않는 상태입니다.", status_code=400)
        if "page" in error.messages or "size" in error.messages: raise BusinessException(code="INVALID_PAGINATION", message="page 또는 size 범위가 올바르지 않습니다.", status_code=400)
        raise


@savings_bp.post("/simulate")
@jwt_required()
def simulate_saving(): return _success(saving_service.simulate(_body()))


@savings_bp.post("")
@jwt_required()
def create_saving(): return _success(saving_service.create(int(get_jwt_identity()), _body()), 201)


@savings_bp.get("")
@jwt_required()
def get_savings(): return _success(saving_service.get_list(int(get_jwt_identity()), _filters(ContractListQuerySchema(), "INVALID_SAVING_STATUS")))


@savings_bp.get("/<int:saving_id>")
@jwt_required()
def get_saving(saving_id): return _success(saving_service.get_detail(int(get_jwt_identity()), saving_id))


@savings_bp.get("/<int:saving_id>/payments")
@jwt_required()
def get_payments(saving_id): return _success(saving_service.get_payments(int(get_jwt_identity()), saving_id, _filters(PaymentListQuerySchema(), "INVALID_PAYMENT_STATUS")))


@savings_bp.post("/<int:saving_id>/terminate")
@jwt_required()
def terminate_saving(saving_id): return _success(saving_service.terminate(int(get_jwt_identity()), saving_id))
