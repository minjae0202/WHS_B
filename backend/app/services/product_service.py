from sqlalchemy.orm import selectinload

from app.errors.exceptions import BusinessException
from app.models.deposits_savings import FinancialProduct, FinancialProductOption, ProductPreferenceCondition
from app.services.deposit_saving_serialization import product as serialize_product


def get_products(filters):
    query = FinancialProduct.query.options(selectinload(FinancialProduct.options))
    for field in ("product_type", "bank_name", "is_active"):
        if filters.get(field) is not None:
            query = query.filter(getattr(FinancialProduct, field) == filters[field])
    page = query.order_by(FinancialProduct.product_id.desc()).paginate(
        page=filters["page"], per_page=filters["size"], error_out=False)
    return {"items": [serialize_product(x) for x in page.items], "page": filters["page"],
            "size": filters["size"], "total_count": page.total}


def get_product(product_id):
    item = (FinancialProduct.query.options(
        selectinload(FinancialProduct.options).selectinload(FinancialProductOption.preference_conditions))
        .filter_by(product_id=product_id).first())
    if item is None:
        raise BusinessException(code="PRODUCT_NOT_FOUND", message="금융상품을 찾을 수 없습니다.", status_code=404)
    return serialize_product(item, include_conditions=True)


def get_option(option_id, expected_type, require_active=False):
    item = FinancialProductOption.query.filter_by(option_id=option_id).first()
    if item is None:
        raise BusinessException(code="PRODUCT_OPTION_NOT_FOUND", message="금융상품 옵션을 찾을 수 없습니다.", status_code=404)
    if item.product.product_type != expected_type:
        raise BusinessException(code="INVALID_PRODUCT_TYPE", message=f"{expected_type} 상품의 옵션이 아닙니다.", status_code=422)
    if require_active and (not item.product.is_active or not item.is_active):
        raise BusinessException(code="PRODUCT_NOT_AVAILABLE", message="현재 가입할 수 없는 상품입니다.", status_code=409)
    return item


def get_conditions(option_id, ids):
    if len(ids) != len(set(ids)):
        raise BusinessException(code="INVALID_REQUEST", message="같은 우대조건을 중복 선택할 수 없습니다.", status_code=400)
    if not ids:
        return []
    rows = ProductPreferenceCondition.query.filter(
        ProductPreferenceCondition.condition_id.in_(ids),
        ProductPreferenceCondition.option_id == option_id,
        ProductPreferenceCondition.is_active.is_(True)).all()
    if len(rows) != len(ids):
        raise BusinessException(code="INVALID_PREFERENCE_CONDITION",
                                message="선택할 수 없는 우대조건이 포함되어 있습니다.", status_code=422)
    return rows


def validate_amount(amount, option, label):
    if not option.min_amount <= amount <= option.max_amount:
        raise BusinessException(code="INVALID_AMOUNT",
                                message=f"{label}이 상품의 최소·최대 금액 범위를 벗어났습니다.", status_code=422)
