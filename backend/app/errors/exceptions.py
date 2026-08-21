class BusinessException(Exception):
    """
    비즈니스 규칙 위반 시 서비스 계층에서 발생시키는 공통 예외.

    사용 예:
        raise BusinessException(
            code="INSUFFICIENT_BALANCE",
            message="계좌 잔액이 부족합니다.",
            status_code=422
        )
    """

    def __init__(self, code, message, status_code=400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)
