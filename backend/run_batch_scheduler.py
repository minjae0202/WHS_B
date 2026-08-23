from apscheduler.schedulers.blocking import BlockingScheduler

from app import create_app
from app.services.deposit_saving_batch_service import run_daily_financial_batch
from app.services.fss_product_service import sync_products
from app.services.monthly_income_batch_service import process_monthly_incomes

app = create_app()


def run_financial_batch():
    with app.app_context():
        app.logger.info("daily financial batch result: %s", run_daily_financial_batch())


def run_fss_sync():
    with app.app_context():
        app.logger.info("FSS product sync result: %s", sync_products())

def run_monthly_income_batch():
    app = create_app()

    with app.app_context():
        result = process_monthly_incomes()
        app.logger.info("Monthly income batch result: %s", result)

scheduler = BlockingScheduler(timezone="Asia/Seoul")
scheduler.add_job(run_financial_batch, "cron", hour=0, minute=5)
scheduler.add_job(run_fss_sync, "cron", hour=2, minute=0)
scheduler.add_job(
    run_monthly_income_batch,
    "cron",
    day=1,
    hour=0,
    minute=10
)

if __name__ == "__main__":
    scheduler.start()
