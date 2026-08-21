from flask import current_app

from itsdangerous import (
    URLSafeTimedSerializer,
    BadSignature,
    SignatureExpired,
)

from app.constants import ErrorCode
from app.errors.exceptions import BusinessException


SOCIAL_SIGNUP_TOKEN_MAX_AGE = 600


def _get_serializer():
    secret_key = current_app.config.get(
        "SOCIAL_SIGNUP_TOKEN_SECRET"
    )

    if not secret_key:
        secret_key = current_app.config[
            "SECRET_KEY"
        ]

    return URLSafeTimedSerializer(
        secret_key=secret_key,
        salt="social-signup",
    )


def create_social_signup_token(
    provider,
    provider_user_id,
    nickname,
):
    serializer = _get_serializer()

    return serializer.dumps({
        "provider": provider,
        "provider_user_id": provider_user_id,
        "nickname": nickname,
    })


def decode_social_signup_token(token):
    serializer = _get_serializer()

    try:
        return serializer.loads(
            token,
            max_age=SOCIAL_SIGNUP_TOKEN_MAX_AGE,
        )

    except (
        SignatureExpired,
        BadSignature,
    ):
        raise BusinessException(
            code=(
                ErrorCode
                .INVALID_SOCIAL_SIGNUP_TOKEN
            ),
            message=(
                "유효하지 않거나 만료된 "
                "소셜 회원가입 토큰입니다."
            ),
            status_code=401,
        )