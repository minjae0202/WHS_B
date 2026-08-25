from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.routes._helpers import load_query_or_raise, require_json_body, success_response
from app.schemas.deposits_savings import ContractListQuerySchema, DepositRequestSchema
from app.services import deposit_service

deposits_bp = Blueprint("deposits", __name__, url_prefix="/api/deposits")


def _body():
    return DepositRequestSchema().load(require_json_body())


def _success(data, status=200):
    return success_response(data, status)


@deposits_bp.post("/simulate")
@jwt_required()
def simulate_deposit(): return _success(deposit_service.simulate(_body()))


@deposits_bp.post("")
@jwt_required()
def create_deposit(): return _success(deposit_service.create(int(get_jwt_identity()), _body()), 201)


@deposits_bp.get("")
@jwt_required()
def get_deposits():
    filters = load_query_or_raise(ContractListQuerySchema(), [
        (("status",), "INVALID_DEPOSIT_STATUS", "지원하지 않는 예금 상태입니다."),
        (("page", "size"), "INVALID_PAGINATION", "page 또는 size 범위가 올바르지 않습니다."),
    ])
    return _success(deposit_service.get_list(int(get_jwt_identity()), filters))


@deposits_bp.get("/<int:deposit_id>")
@jwt_required()
def get_deposit(deposit_id): return _success(deposit_service.get_detail(int(get_jwt_identity()), deposit_id))


@deposits_bp.post("/<int:deposit_id>/terminate")
@jwt_required()
def terminate_deposit(deposit_id): return _success(deposit_service.terminate(int(get_jwt_identity()), deposit_id))
