from datetime import datetime, timezone

from app.models.simulation_setting import SimulationSetting
from app.models.monthly_cash_flow import MonthlyCashFlow

from app.services.monthly_income_service import pay_monthly_income


def process_monthly_incomes():
    # 현재 UTC 기준 연-월
    now = datetime.now(timezone.utc)
    year_month = now.strftime("%Y-%m")

    # 시뮬레이션 설정이 존재하는 모든 사용자 조회
    settings = SimulationSetting.query.all()

    processed_count = 0
    skipped_count = 0

    for setting in settings:
        # 이미 이번 달에 지급되었는지 확인
        existing_cash_flow = MonthlyCashFlow.query.filter_by(
            user_id=setting.user_id,
            year_month=year_month
        ).first()

        if existing_cash_flow is not None:
            skipped_count += 1
            continue

        pay_monthly_income(
            user_id=setting.user_id,
            year_month=year_month
        )

        processed_count += 1

    return {
        "year_month": year_month,
        "processed_count": processed_count,
        "skipped_count": skipped_count
    }