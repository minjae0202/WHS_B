from marshmallow import Schema, fields, validate


class InitialAssetSchema(Schema):
    initial_asset = fields.Integer(
        required=True,
        strict=True,
        validate=validate.Range(
            min=0,
            max=100000000
        )
    )


class SimulationSettingsSchema(Schema):
    monthly_income = fields.Integer(
        required=True,
        strict=True,
        validate=validate.Range(
            min=0,
            max=10000000
        )
    )

    monthly_expense = fields.Integer(
        required=True,
        strict=True,
        validate=validate.Range(
            min=0,
            max=10000000
        )
    )