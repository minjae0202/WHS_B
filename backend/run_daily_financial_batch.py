from app import create_app
from app.services.deposit_saving_batch_service import run_daily_financial_batch


app = create_app()

with app.app_context():
    print(run_daily_financial_batch())
