from datetime import datetime

from sqlalchemy import Numeric

from app.extensions import db


class MarketAsset(db.Model):
    """시장 자산 (주식 / ETF 종목 정보)"""

    __tablename__ = "market_assets"

    asset_id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    asset_type = db.Column(db.String(10), nullable=False)   # STOCK | ETF
    market = db.Column(db.String(2), nullable=False)        # KR | US
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    def __repr__(self):
        return f"<MarketAsset {self.symbol} ({self.market})>"


class MarketHolding(db.Model):
    """사용자별 보유 종목"""

    __tablename__ = "market_holdings"
    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "asset_id",
            name="uq_market_holdings_user_asset",
        ),
    )

    holding_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )
    asset_id = db.Column(
        db.Integer,
        db.ForeignKey("market_assets.asset_id"),
        nullable=False,
    )

    # 소수점 수량 대비 (미국 주식 분할 등)
    quantity = db.Column(Numeric(20, 8), nullable=False, default=0)

    # 거래 통화 기준 총 취득원가 (USD 종목은 달러, KR 종목은 원화)
    total_acquisition_cost = db.Column(Numeric(20, 4), nullable=False, default=0)

    # 원화 기준 총 취득원가 (환차손익 계산용)
    total_acquisition_cost_krw = db.Column(db.BigInteger, nullable=False, default=0)

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    asset = db.relationship("MarketAsset")

    def __repr__(self):
        return f"<MarketHolding user={self.user_id} asset={self.asset_id}>"


class MarketTransaction(db.Model):
    """주식 / ETF 거래 체결 기록 (생성 후 수정하지 않는다)"""

    __tablename__ = "market_transactions"

    market_transaction_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )
    asset_id = db.Column(
        db.Integer,
        db.ForeignKey("market_assets.asset_id"),
        nullable=False,
    )

    side = db.Column(db.String(4), nullable=False)           # BUY | SELL
    quantity = db.Column(Numeric(20, 8), nullable=False)
    price = db.Column(Numeric(20, 4), nullable=False)        # 거래 통화 기준 단가

    # 국내 종목은 환율 개념이 없으므로 NULL
    exchange_rate = db.Column(Numeric(12, 4), nullable=True)

    amount = db.Column(Numeric(20, 4), nullable=False)       # 거래 통화 기준 거래금액
    amount_krw = db.Column(db.BigInteger, nullable=False)    # 원화 환산 거래금액

    market_session = db.Column(db.String(10), nullable=False)
    fee = db.Column(db.BigInteger, nullable=False, default=0)   # 원화 수수료
    tax = db.Column(db.BigInteger, nullable=False, default=0)   # 원화 세금

    executed_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    asset = db.relationship("MarketAsset")

    def __repr__(self):
        return (
            f"<MarketTransaction {self.side} "
            f"asset={self.asset_id} qty={self.quantity}>"
        )
