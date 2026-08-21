from marshmallow import Schema, ValidationError, fields, validate, validates

from app.constants import (
    MAX_ORDER_QUANTITY,
    MIN_ORDER_QUANTITY,
    SYMBOL_PATTERN,
    Market,
    OrderSide,
)


class PriceQuerySchema(Schema):
    """GET /api/investments/price"""

    symbol = fields.String(
        required=True,
        validate=[
            validate.Length(min=1, max=20),
            validate.Regexp(SYMBOL_PATTERN),
        ],
    )

    market = fields.String(
        required=True,
        validate=validate.OneOf([
            Market.KR.value,
            Market.US.value,
        ]),
    )

    @validates("symbol")
    def validate_symbol(self, value, **kwargs):
        if value.strip() == "":
            raise ValidationError(
                "종목 코드를 입력해야 합니다."
            )


class OrderCreateSchema(Schema):
    """POST /api/investments/orders"""

    symbol = fields.String(
        required=True,
        validate=[
            validate.Length(min=1, max=20),
            validate.Regexp(SYMBOL_PATTERN),
        ],
    )

    market = fields.String(
        required=True,
        validate=validate.OneOf([
            Market.KR.value,
            Market.US.value,
        ]),
    )

    side = fields.String(
        required=True,
        validate=validate.OneOf([
            OrderSide.BUY.value,
            OrderSide.SELL.value,
        ]),
    )

    quantity = fields.Integer(
        required=True,
        strict=True,
        validate=validate.Range(
            min=MIN_ORDER_QUANTITY,
            max=MAX_ORDER_QUANTITY,
        ),
    )

    @validates("symbol")
    def validate_symbol(self, value, **kwargs):
        if value.strip() == "":
            raise ValidationError(
                "종목 코드를 입력해야 합니다."
            )
