from datetime import datetime

from app.extensions import db


class Account(db.Model):
    __tablename__ = "accounts"

    account_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        unique=True,
        nullable=False,
    )

    account_number = db.Column(
        db.String(12),
        unique=True,
        nullable=False,
    )

    balance = db.Column(
        db.BigInteger,
        nullable=False,
        default=0,
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    def __repr__(self):
        return f"<Account {self.account_number}>"