from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from app.errors.exceptions import BusinessException
from app.schemas.deposits_savings import ContractListQuerySchema, DepositRequestSchema
from app.services import deposit_service

deposits_bp = Blueprint("deposits", __name__, url_prefix="/api/deposits")


def _body():
    value = request.get_json(silent=True)
    if not isinstance(value, dict):
        raise BusinessException(code="INVALID_REQUEST", message="JSON 객체 형식의 요청 본문이 필요합니다.", status_code=400)
    return DepositRequestSchema().load(value)


def _success(data, status=200):
    return jsonify({"success": True, "data": data, "message": "요청이 성공했습니다."}), status


@deposits_bp.post("/simulate")
@jwt_required()
def simulate_deposit(): return _success(deposit_service.simulate(_body()))


@deposits_bp.post("")
@jwt_required()
def create_deposit(): return _success(deposit_service.create(int(get_jwt_identity()), _body()), 201)


@deposits_bp.get("")
@jwt_required()
def get_deposits():
    try: filters = ContractListQuerySchema().load(request.args)
    except ValidationError as error:
        if "status" in error.messages: raise BusinessException(code="INVALID_DEPOSIT_STATUS", message="지원하지 않는 예금 상태입니다.", status_code=400)
        if "page" in error.messages or "size" in error.messages: raise BusinessException(code="INVALID_PAGINATION", message="page 또는 size 범위가 올바르지 않습니다.", status_code=400)
        raise
    return _success(deposit_service.get_list(int(get_jwt_identity()), filters))


@deposits_bp.get("/<int:deposit_id>")
@jwt_required()
def get_deposit(deposit_id): return _success(deposit_service.get_detail(int(get_jwt_identity()), deposit_id))


@deposits_bp.post("/<int:deposit_id>/terminate")
@jwt_required()
def terminate_deposit(deposit_id): return _success(deposit_service.terminate(int(get_jwt_identity()), deposit_id))
