from flask import Blueprint, request

from app.errors.exceptions import BusinessException
from app.routes._helpers import load_query_or_raise, success_response
from app.schemas.deposits_savings import ProductListQuerySchema
from app.services import product_service

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.get("")
def get_products():
    raw = request.args.get("is_active")
    if raw is not None and raw.lower() not in ("true", "false"):
        raise BusinessException(code="INVALID_REQUEST", message="is_active는 true 또는 false여야 합니다.", status_code=400)
    filters = load_query_or_raise(ProductListQuerySchema(), [
        (("product_type",), "INVALID_PRODUCT_TYPE", "상품 유형은 DEPOSIT 또는 SAVING이어야 합니다."),
        (("page", "size"), "INVALID_PAGINATION", "page는 1 이상, size는 1 이상 100 이하여야 합니다."),
    ])
    return success_response(product_service.get_products(filters))


@products_bp.get("/<int:product_id>")
def get_product(product_id):
    return success_response(product_service.get_product(product_id))
