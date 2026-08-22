from apscheduler.schedulers.blocking import BlockingScheduler

from app import create_app
from app.services.deposit_saving_batch_service import run_daily_financial_batch
from app.services.fss_product_service import sync_products


app = create_app()


def run_financial_batch():
    with app.app_context():
        app.logger.info("daily financial batch result: %s", run_daily_financial_batch())


def run_fss_sync():
    with app.app_context():
        app.logger.info("FSS product sync result: %s", sync_products())


scheduler = BlockingScheduler(timezone="Asia/Seoul")
scheduler.add_job(run_financial_batch, "cron", hour=0, minute=5)
scheduler.add_job(run_fss_sync, "cron", hour=2, minute=0)


if __name__ == "__main__":
    scheduler.start()
