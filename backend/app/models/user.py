from app.constants import UserRole, UserStatus
from app.extensions import db
from app.models.base import TimestampMixin


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    user_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )

    username = db.Column(
        db.String(20),
        nullable=False,
        unique=True,
        index=True,
    )

    password_hash = db.Column(
        db.String(255),
        nullable=True,
    )

    nickname = db.Column(
        db.String(20),
        nullable=False,
    )

    role = db.Column(
        db.String(20),
        nullable=False,
        default=UserRole.USER.value,
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default=UserStatus.ACTIVE.value,
    )

    representative_badge_id = db.Column(
        db.Integer,
        nullable=True,
    )

    failed_login_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    login_locked_until = db.Column(
        db.DateTime,
        nullable=True,
    )

    token_version = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    def __repr__(self):
        return f"<User {self.username}>"