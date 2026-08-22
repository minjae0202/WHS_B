from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.errors.exceptions import BusinessException
from app.schemas.deposits_savings import ProductListQuerySchema
from app.services import product_service

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.get("")
def get_products():
    raw = request.args.get("is_active")
    if raw is not None and raw.lower() not in ("true", "false"):
        raise BusinessException(code="INVALID_REQUEST", message="is_active는 true 또는 false여야 합니다.", status_code=400)
    try:
        filters = ProductListQuerySchema().load(request.args)
    except ValidationError as error:
        if "product_type" in error.messages:
            raise BusinessException(code="INVALID_PRODUCT_TYPE", message="상품 유형은 DEPOSIT 또는 SAVING이어야 합니다.", status_code=400)
        if "page" in error.messages or "size" in error.messages:
            raise BusinessException(code="INVALID_PAGINATION", message="page는 1 이상, size는 1 이상 100 이하여야 합니다.", status_code=400)
        raise
    return jsonify({"success": True, "data": product_service.get_products(filters),
                    "message": "요청이 성공했습니다."}), 200


@products_bp.get("/<int:product_id>")
def get_product(product_id):
    return jsonify({"success": True, "data": product_service.get_product(product_id),
                    "message": "요청이 성공했습니다."}), 200
