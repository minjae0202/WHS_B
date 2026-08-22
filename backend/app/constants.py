from decimal import Decimal
from enum import Enum


class AssetType(str, Enum):
    """자산 유형"""
    STOCK = "STOCK"
    ETF = "ETF"


class Market(str, Enum):
    """시장 구분"""
    KR = "KR"
    US = "US"


class OrderSide(str, Enum):
    """주문 방향"""
    BUY = "BUY"
    SELL = "SELL"


class MarketSession(str, Enum):
    """시장 세션"""
    PRE_MARKET = "PRE_MARKET"      # 프리마켓 (미국 전용)
    REGULAR = "REGULAR"            # 정규장
    AFTER_MARKET = "AFTER_MARKET"  # 애프터마켓 (미국 전용)
    CLOSED = "CLOSED"              # 장 마감
    HOLIDAY = "HOLIDAY"            # 휴장일 (주말 포함)


# 거래 가능한 세션
# 현재는 국내·미국 모두 정규장에서만 체결한다.
# 미국 프리마켓/애프터마켓 체결을 허용하려면 아래 집합에 추가한다.
TRADABLE_SESSIONS = {
    Market.KR: {MarketSession.REGULAR},
    Market.US: {MarketSession.REGULAR},
}

# 거래 수수료율
FEE_RATE = {
    Market.KR: Decimal("0.00015"),   # 0.015%
    Market.US: Decimal("0.0007"),    # 0.07%
}

# 증권거래세 (국내 매도 시에만 부과)
KR_SELL_TAX_RATE = Decimal("0.0018")  # 0.18%

# 원화 환산 대상 통화
CURRENCY = {
    Market.KR: "KRW",
    Market.US: "USD",
}

# yfinance 환율 티커
EXCHANGE_RATE_TICKER = "USDKRW=X"

# 원장 참조 타입
LEDGER_REFERENCE_TYPE_MARKET = "MARKET_TRANSACTION"

# 주문 수량 범위 (비정상 입력 방지)
MIN_ORDER_QUANTITY = 1
MAX_ORDER_QUANTITY = 1000000

# 종목 코드 허용 문자 (영문/숫자/./-)
SYMBOL_PATTERN = r"^[A-Za-z0-9.\-]+$"


class InvestmentErrorCode:
    """주식/ETF 도메인 Error Code"""
    INVALID_REQUEST = "INVALID_REQUEST"
    INVALID_AMOUNT = "INVALID_AMOUNT"
    ASSET_NOT_FOUND = "ASSET_NOT_FOUND"
    MARKET_CLOSED = "MARKET_CLOSED"
    INSUFFICIENT_HOLDINGS = "INSUFFICIENT_HOLDINGS"
    PRICE_UNAVAILABLE = "PRICE_UNAVAILABLE"
    EXCHANGE_RATE_UNAVAILABLE = "EXCHANGE_RATE_UNAVAILABLE"


class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    WITHDRAWN = "WITHDRAWN"


class SocialProvider(str, Enum):
    GOOGLE = "GOOGLE"
    KAKAO = "KAKAO"


class ErrorCode:
    INVALID_REQUEST = "INVALID_REQUEST"
    DUPLICATE_USERNAME = "DUPLICATE_USERNAME"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"

    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    LOGIN_LOCKED = "LOGIN_LOCKED"

    AUTH_REQUIRED = "AUTH_REQUIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    TOKEN_REVOKED = "TOKEN_REVOKED"

    ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED"
    ACCOUNT_WITHDRAWN = "ACCOUNT_WITHDRAWN"

    USER_NOT_FOUND = "USER_NOT_FOUND"

    CURRENT_PASSWORD_MISMATCH = "CURRENT_PASSWORD_MISMATCH"
    PASSWORD_NOT_SET = "PASSWORD_NOT_SET"

    GOOGLE_AUTH_FAILED = "GOOGLE_AUTH_FAILED"
    KAKAO_AUTH_FAILED = "KAKAO_AUTH_FAILED"
    SOCIAL_AUTH_FAILED = "SOCIAL_AUTH_FAILED"

    INVALID_SOCIAL_PROFILE = "INVALID_SOCIAL_PROFILE"
    INVALID_SOCIAL_SIGNUP_TOKEN = "INVALID_SOCIAL_SIGNUP_TOKEN"
    SOCIAL_ACCOUNT_ALREADY_EXISTS = "SOCIAL_ACCOUNT_ALREADY_EXISTS"


class EntryType(str, Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"


class TransactionType(str, Enum):
    STOCK_BUY = "STOCK_BUY"
    STOCK_SELL = "STOCK_SELL"
    DEPOSIT_JOIN = "DEPOSIT_JOIN"
    DEPOSIT_CANCEL = "DEPOSIT_CANCEL"
    SAVING_PAYMENT = "SAVING_PAYMENT"
    SAVING_CANCEL = "SAVING_CANCEL"
    DEPOSIT_MATURITY = "DEPOSIT_MATURITY"
    SAVING_MATURITY = "SAVING_MATURITY"
