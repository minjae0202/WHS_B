from marshmallow import Schema, fields, validate


class ProductListQuerySchema(Schema):
    product_type = fields.String(load_default=None, allow_none=True,
                                 validate=validate.OneOf(["DEPOSIT", "SAVING"]))
    bank_name = fields.String(load_default=None, allow_none=True)
    is_active = fields.Boolean(load_default=True)
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    size = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))


class ContractListQuerySchema(Schema):
    status = fields.String(load_default=None, allow_none=True,
                           validate=validate.OneOf(["ACTIVE", "MATURED", "TERMINATED"]))
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    size = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))


class PaymentListQuerySchema(Schema):
    status = fields.String(load_default=None, allow_none=True,
                           validate=validate.OneOf(["PAID", "MISSED"]))
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    size = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))


class DepositRequestSchema(Schema):
    option_id = fields.Integer(required=True, strict=True)
    principal = fields.Integer(required=True, strict=True, validate=validate.Range(min=1))
    selected_condition_ids = fields.List(fields.Integer(strict=True), load_default=list)


class SavingRequestSchema(Schema):
    option_id = fields.Integer(required=True, strict=True)
    monthly_amount = fields.Integer(required=True, strict=True, validate=validate.Range(min=1))
    payment_day = fields.Integer(required=True, strict=True, validate=validate.Range(min=1, max=28))
    selected_condition_ids = fields.List(fields.Integer(strict=True), load_default=list)
