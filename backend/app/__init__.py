import os
from datetime import timedelta

from flask import Flask, jsonify
from marshmallow import ValidationError

from app.errors.exceptions import BusinessException
from app.extensions import db, jwt


def create_app():
    app = Flask(__name__)

    # --- 설정 ---
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///dev.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "change-me-in-env"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)

    # --- 확장 초기화 ---
    db.init_app(app)
    jwt.init_app(app)

    # --- 모델 import (Flask-Migrate가 인식하려면 반드시 필요) ---
    # 각자 담당 모델을 여기에 추가한다.
    # from app.models.user import User
    # from app.models.account import Account
    from app.models.market import MarketAsset, MarketHolding, MarketTransaction  # noqa

    # --- Blueprint 등록 ---
    # 각자 담당 라우트를 여기에 추가한다.
    # from app.routes.auth import auth_bp
    # app.register_blueprint(auth_bp)

    # from app.routes.accounts import accounts_bp
    # app.register_blueprint(accounts_bp)

    from app.routes.investments import investments_bp
    app.register_blueprint(investments_bp)

    # --- 공통 에러 핸들러 (개발 가이드 8번) ---
    @app.errorhandler(BusinessException)
    def handle_business_exception(e):
        return jsonify({
            "success": False,
            "error": {"code": e.code, "message": e.message}
        }), e.status_code

    @app.errorhandler(ValidationError)
    def handle_validation_error(e):
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_REQUEST",
                "message": str(e.messages)
            }
        }), 400

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            "success": False,
            "error": {"code": "NOT_FOUND", "message": "요청한 경로를 찾을 수 없습니다."}
        }), 404

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        # 예상 못한 서버 오류는 내부 정보를 노출하지 않는다 (개발 가이드 8번)
        app.logger.exception(e)
        return jsonify({
            "success": False,
            "error": {"code": "INTERNAL_SERVER_ERROR", "message": "서버 내부 오류가 발생했습니다."}
        }), 500

    return app
