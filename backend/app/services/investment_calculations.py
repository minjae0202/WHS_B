"""
주식 / ETF 수수료·세금·정산 금액 계산.

순수 계산 함수만 포함한다 (DB 접근 없음).
"""

from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

from app.constants import FEE_RATE, KR_SELL_TAX_RATE, InvestmentErrorCode, Market, OrderSide
from app.errors.exceptions import BusinessException


def to_krw(amount, exchange_rate):
    """거래 통화 금액을 원화 정수로 환산한다."""
    if exchange_rate is not None:
        amount = amount * exchange_rate

    return int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def calculate_fee(amount_krw, market):
    """거래 수수료를 계산한다. 사용자에게 유리하도록 절사한다."""
    fee = Decimal(amount_krw) * FEE_RATE[market]

    return int(fee.quantize(Decimal("1"), rounding=ROUND_DOWN))


def calculate_tax(amount_krw, market, side):
    """국내 매도 시에만 증권거래세를 부과한다."""
    if market != Market.KR or side != OrderSide.SELL:
        return 0

    tax = Decimal(amount_krw) * KR_SELL_TAX_RATE

    return int(tax.quantize(Decimal("1"), rounding=ROUND_DOWN))


def calculate_settlement(amount_krw, fee, tax, side):
    """
    실제 계좌 증감 금액을 계산한다.

    매수: 거래금액 + 수수료
    매도: 거래금액 - 수수료 - 세금
    """
    if side == OrderSide.BUY:
        settlement = amount_krw + fee
    else:
        settlement = amount_krw - fee - tax

    # debit() / credit()은 0 이하 금액을 INVALID_AMOUNT로 거부한다
    if settlement <= 0:
        raise BusinessException(
            code=InvestmentErrorCode.INVALID_AMOUNT,
            message="정산 금액이 0원 이하여서 주문할 수 없습니다.",
            status_code=422,
        )

    return settlement


def serialize_price(price, market):
    """원화는 정수, 달러는 소수로 응답한다."""
    if market == Market.KR:
        return int(price.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    return float(price)
