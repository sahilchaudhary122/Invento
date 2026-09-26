import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.base_class import Base
from app.db.session import engine, SessionLocal
from app.models.inventory import StockLedger
from app.models.product import Category, Product
from app.models.location import Warehouse, Location
from app.models.stock import Stock

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def auth_headers():
    client.post("/api/v1/auth/signup", json={"email": "op@example.com", "name": "Op User", "password": "password123"})
    response = client.post("/api/v1/auth/login", data={"username": "op@example.com", "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_data():
    db = SessionLocal()
    cat = Category(name="Test Cat")
    prod = Product(name="Test Prod", sku="SKU1", category=cat)
    wh = Warehouse(name="WH1", code="WH1")
    loc1 = Location(name="L1", code="L1", warehouse=wh)
    loc2 = Location(name="L2", code="L2", warehouse=wh)
    db.add_all([cat, prod, wh, loc1, loc2])
    db.commit()
    data = {"product_id": prod.id, "loc1_id": loc1.id, "loc2_id": loc2.id, "cat_id": cat.id}
    db.close()
    return data

def test_ledger_creation_on_validate(auth_headers, test_data):
    # Receipt
    response = client.post("/api/v1/receipts/", json={
        "reference": "R-LEDGER",
        "supplier_id": str(uuid.uuid4()),
        "items": [{"product_id": str(test_data["product_id"]), "quantity": 10}]
    }, headers=auth_headers)
    receipt_id = response.json()["id"]
    
    client.post(f"/api/v1/receipts/{receipt_id}/validate", json={"location_id": str(test_data["loc1_id"])}, headers=auth_headers)
    
    db = SessionLocal()
    ledger = db.query(StockLedger).filter_by(reference="R-LEDGER", operation_type="RECEIPT").first()
    assert ledger is not None
    assert ledger.quantity == 10
    db.close()

def test_ledger_rollback_on_failure(auth_headers, test_data):
    # Receipt with invalid location (should fail and not create ledger)
    response = client.post("/api/v1/receipts/", json={
        "reference": "R-FAIL",
        "supplier_id": str(uuid.uuid4()),
        "items": [{"product_id": str(test_data["product_id"]), "quantity": 10}]
    }, headers=auth_headers)
    receipt_id = response.json()["id"]
    
    client.post(f"/api/v1/receipts/{receipt_id}/validate", json={"location_id": str(uuid.uuid4())}, headers=auth_headers)
    
    db = SessionLocal()
    ledger = db.query(StockLedger).filter_by(reference="R-FAIL").first()
    assert ledger is None
    db.close()

def test_dashboard_kpis(auth_headers, test_data):
    # Setup stock
    db = SessionLocal()
    from app.services.stock import add_stock
    # add_stock for product with reorder_threshold=0 (default)
    add_stock(db, test_data["product_id"], test_data["loc1_id"], 10)
    db.commit()
    db.close()
    
    response = client.get("/api/v1/dashboard/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_products_in_stock"] == 1
    # 10 > 0, so it is not low stock.
    assert data["low_or_out_of_stock"] == 0 
    assert data["pending_receipts"] == 0
    assert data["pending_deliveries"] == 0
    assert data["internal_transfers_scheduled"] == 0
