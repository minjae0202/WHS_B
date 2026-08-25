from flask import jsonify, request
from marshmallow import ValidationError

from app.errors.exceptions import BusinessException


def require_json_body():
    value = request.get_json(silent=True)
    if not isinstance(value, dict):
        raise BusinessException(code="INVALID_REQUEST", message="JSON 객체 형식의 요청 본문이 필요합니다.", status_code=400)
    return value


def success_response(data, status=200, message="요청이 성공했습니다."):
    return jsonify({"success": True, "data": data, "message": message}), status


def load_query_or_raise(schema, error_map):
    """
    schema.load(request.args)를 시도하고, ValidationError 발생 시 error_map을 순서대로
    확인해 매칭되는 필드가 있으면 해당 BusinessException으로 변환해 raise한다.
    error_map: [(fields, code, message), ...]
    """
    try:
        return schema.load(request.args)
    except ValidationError as error:
        for fields, code, message in error_map:
            if any(field in error.messages for field in fields):
                raise BusinessException(code=code, message=message, status_code=400)
        raise
