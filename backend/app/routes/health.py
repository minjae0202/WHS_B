from flask import Blueprint
from sqlalchemy import text

from app.extensions import db


health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.get("/health")
def health_check():
    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        db.session.rollback()
        return {
            "success": False,
            "error": {
                "code": "DATABASE_UNAVAILABLE",
                "message": "데이터베이스 연결을 확인할 수 없습니다.",
            },
        }, 503

    return {
        "success": True,
        "data": {"database": "UP"},
        "message": "요청이 성공했습니다.",
    }, 200
