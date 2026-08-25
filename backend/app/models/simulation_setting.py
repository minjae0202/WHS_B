from app.extensions import db
from app.models.base import TimestampMixin


class SimulationSetting(TimestampMixin, db.Model):
    __tablename__ = "simulation_settings"

    simulation_setting_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
        unique=True
    )

    initial_asset = db.Column(
        db.BigInteger,
        nullable=False,
        default=0
    )

    is_initial_asset_set = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    monthly_income = db.Column(
        db.BigInteger,
        nullable=False,
        default=0
    )

    monthly_expense = db.Column(
        db.BigInteger,
        nullable=False,
        default=0
    )

    __table_args__ = (
        db.CheckConstraint(
            "initial_asset >= 0 AND initial_asset <= 100000000",
            name="ck_simulation_initial_asset"
        ),
        db.CheckConstraint(
            "monthly_income >= 0 AND monthly_income <= 10000000",
            name="ck_simulation_monthly_income"
        ),
        db.CheckConstraint(
            "monthly_expense >= 0 AND monthly_expense <= 10000000",
            name="ck_simulation_monthly_expense"
        ),
        db.CheckConstraint(
            "monthly_expense <= monthly_income",
            name="ck_simulation_expense_income"
        ),
    )