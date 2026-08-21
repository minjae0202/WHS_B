from app.extensions import db


class SocialAccount(db.Model):
    __tablename__ = "social_accounts"

    social_account_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )

    provider = db.Column(
        db.String(20),
        nullable=False,
    )

    provider_user_id = db.Column(
        db.String(255),
        nullable=False,
    )

    __table_args__ = (
        db.UniqueConstraint(
            "provider",
            "provider_user_id",
            name="uq_social_provider_user",
        ),
    )

    def __repr__(self):
        return f"<SocialAccount {self.provider}>"