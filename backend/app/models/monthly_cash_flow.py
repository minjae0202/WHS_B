from datetime import datetime

from app.extensions import db


class MonthlyCashFlow(db.Model):
    __tablename__ = "monthly_cash_flows"

    monthly_cash_flow_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    year_month = db.Column(
        db.String(7),
        nullable=False
    )

    income_amount = db.Column(
        db.BigInteger,
        nullable=False,
        default=0
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="PROCESSED"
    )

    processed_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "year_month",
            name="uq_monthly_cash_flows_user_year_month"
        ),

        db.CheckConstraint(
            "income_amount >= 0",
            name="ck_monthly_cash_flows_income_amount"
        ),
    )