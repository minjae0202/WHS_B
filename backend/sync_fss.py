from app import create_app
from app.services.fss_product_service import sync_products

app = create_app()
with app.app_context():
    print(sync_products())
