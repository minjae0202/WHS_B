import requests

from flask import current_app

from app.constants import (
    ErrorCode,
    SocialProvider
)
from app.errors.exceptions import BusinessException


GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

GOOGLE_USERINFO_URL = (
    "https://openidconnect.googleapis.com/"
    "v1/userinfo"
)

KAKAO_TOKEN_URL = (
    "https://kauth.kakao.com/oauth/token"
)

KAKAO_USERINFO_URL = (
    "https://kapi.kakao.com/v2/user/me"
)


def get_social_profile(
    provider,
    code
):
    if provider == SocialProvider.GOOGLE:
        return _get_google_profile(code)

    if provider == SocialProvider.KAKAO:
        return _get_kakao_profile(code)

    raise BusinessException(
        code=ErrorCode.INVALID_REQUEST,
        message="지원하지 않는 소셜 로그인 제공자입니다.",
        status_code=400
    )


def _get_google_profile(code):
    try:
        token_response = requests.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": current_app.config[
                    "GOOGLE_CLIENT_ID"
                ],
                "client_secret": current_app.config[
                    "GOOGLE_CLIENT_SECRET"
                ],
                "redirect_uri": current_app.config[
                    "GOOGLE_REDIRECT_URI"
                ],
                "grant_type":
                    "authorization_code"
            },
            timeout=5
        )

        token_response.raise_for_status()

        access_token = (
            token_response
            .json()
            .get("access_token")
        )

        if not access_token:
            raise ValueError(
                "Google access token missing"
            )

        profile_response = requests.get(
            GOOGLE_USERINFO_URL,
            headers={
                "Authorization":
                    f"Bearer {access_token}"
            },
            timeout=5
        )

        profile_response.raise_for_status()

        profile = profile_response.json()

        provider_user_id = profile.get(
            "sub"
        )

        nickname = profile.get(
            "name"
        )

        if not provider_user_id:
            raise ValueError(
                "Google user id missing"
            )

        return {
            "provider":
                SocialProvider.GOOGLE,
            "provider_user_id":
                str(provider_user_id),
            "nickname":
                nickname
        }

    except BusinessException:
        raise

    except (
        requests.RequestException,
        ValueError,
        KeyError
    ):
        raise BusinessException(
            code=ErrorCode.GOOGLE_AUTH_FAILED,
            message="Google 인증에 실패했습니다.",
            status_code=401
        )


def _get_kakao_profile(code):
    try:
        token_data = {
            "grant_type":
                "authorization_code",
            "client_id":
                current_app.config[
                    "KAKAO_REST_API_KEY"
                ],
            "redirect_uri":
                current_app.config[
                    "KAKAO_REDIRECT_URI"
                ],
            "code":
                code
        }

        kakao_client_secret = (
            current_app.config.get(
                "KAKAO_CLIENT_SECRET"
            )
        )

        if kakao_client_secret:
            token_data[
                "client_secret"
            ] = kakao_client_secret

        token_response = requests.post(
            KAKAO_TOKEN_URL,
            data=token_data,
            headers={
                "Content-Type":
                    "application/"
                    "x-www-form-urlencoded;"
                    "charset=utf-8"
            },
            timeout=5
        )

        token_response.raise_for_status()

        access_token = (
            token_response
            .json()
            .get("access_token")
        )

        if not access_token:
            raise ValueError(
                "Kakao access token missing"
            )

        profile_response = requests.get(
            KAKAO_USERINFO_URL,
            headers={
                "Authorization":
                    f"Bearer {access_token}"
            },
            timeout=5
        )

        profile_response.raise_for_status()

        profile = profile_response.json()

        provider_user_id = profile.get(
            "id"
        )

        kakao_account = profile.get(
            "kakao_account",
            {}
        )

        kakao_profile = (
            kakao_account.get(
                "profile",
                {}
            )
        )

        nickname = kakao_profile.get(
            "nickname"
        )

        if provider_user_id is None:
            raise ValueError(
                "Kakao user id missing"
            )

        return {
            "provider":
                SocialProvider.KAKAO,
            "provider_user_id":
                str(provider_user_id),
            "nickname":
                nickname
        }

    except BusinessException:
        raise

    except (
        requests.RequestException,
        ValueError,
        KeyError
    ):
        raise BusinessException(
            code=ErrorCode.KAKAO_AUTH_FAILED,
            message="Kakao 인증에 실패했습니다.",
            status_code=401
        )