import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.base_class import Base
from app.db.session import engine, SessionLocal
from app.models.inventory import Receipt, Delivery, Transfer, Adjustment
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
    # Helper to get auth headers
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
    db.refresh(prod)
    db.refresh(loc1)
    db.refresh(loc2)
    data = {"product": prod, "loc1": loc1, "loc2": loc2, "cat": cat}
    db.close()
    return data

def test_receipt_flow(auth_headers, test_data):
    # Create draft
    response = client.post("/api/v1/receipts/", json={
        "reference": "R1",
        "supplier_id": str(uuid.uuid4()),
        "items": [{"product_id": str(test_data["product"].id), "quantity": 10}]
    }, headers=auth_headers)
    assert response.status_code == 200
    receipt_id = response.json()["id"]
    
    # Validate
    response = client.post(f"/api/v1/receipts/{receipt_id}/validate", json={"location_id": str(test_data["loc1"].id)}, headers=auth_headers)
    assert response.status_code == 200
    
    # Verify stock
    db = SessionLocal()
    stock = db.query(Stock).filter_by(product_id=test_data["product"].id, location_id=test_data["loc1"].id).first()
    assert stock.quantity == 10
    db.close()

def test_delivery_flow(auth_headers, test_data):
    # Setup initial stock
    db = SessionLocal()
    from app.services.stock import add_stock
    add_stock(db, test_data["product"].id, test_data["loc1"].id, 10)
    db.commit()
    db.close()
    
    # Create draft
    response = client.post("/api/v1/deliveries/", json={
        "reference": "D1",
        "source_location_id": str(test_data["loc1"].id),
        "items": [{"product_id": str(test_data["product"].id), "quantity": 4}]
    }, headers=auth_headers)
    assert response.status_code == 200
    delivery_id = response.json()["id"]
    
    # Validate
    response = client.post(f"/api/v1/deliveries/{delivery_id}/validate", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify stock
    db = SessionLocal()
    stock = db.query(Stock).filter_by(product_id=test_data["product"].id, location_id=test_data["loc1"].id).first()
    assert stock.quantity == 6
    db.close()

def test_transfer_flow(auth_headers, test_data):
    # Setup initial stock
    db = SessionLocal()
    from app.services.stock import add_stock
    add_stock(db, test_data["product"].id, test_data["loc1"].id, 10)
    db.commit()
    db.close()
    
    # Create draft
    response = client.post("/api/v1/transfers/", json={
        "reference": "T1",
        "source_location_id": str(test_data["loc1"].id),
        "destination_location_id": str(test_data["loc2"].id),
        "items": [{"product_id": str(test_data["product"].id), "quantity": 4}]
    }, headers=auth_headers)
    assert response.status_code == 200
    transfer_id = response.json()["id"]
    
    # Validate
    response = client.post(f"/api/v1/transfers/{transfer_id}/validate", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify stock
    db = SessionLocal()
    s1 = db.query(Stock).filter_by(product_id=test_data["product"].id, location_id=test_data["loc1"].id).first()
    s2 = db.query(Stock).filter_by(product_id=test_data["product"].id, location_id=test_data["loc2"].id).first()
    assert s1.quantity == 6
    assert s2.quantity == 4
    db.close()

def test_adjustment_flow(auth_headers, test_data):
    # Setup initial stock
    db = SessionLocal()
    from app.services.stock import add_stock
    add_stock(db, test_data["product"].id, test_data["loc1"].id, 10)
    db.commit()
    db.close()
    
    # Create draft
    response = client.post("/api/v1/adjustments/", json={
        "reference": "A1",
        "location_id": str(test_data["loc1"].id),
        "reason": "Counted 15",
        "items": [{"product_id": str(test_data["product"].id), "physical_quantity": 15}]
    }, headers=auth_headers)
    assert response.status_code == 200
    adj_id = response.json()["id"]
    
    # Validate
    response = client.post(f"/api/v1/adjustments/{adj_id}/validate", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify stock
    db = SessionLocal()
    stock = db.query(Stock).filter_by(product_id=test_data["product"].id, location_id=test_data["loc1"].id).first()
    assert stock.quantity == 15
    db.close()

def test_receipt_atomic_rollback(auth_headers, test_data):
    # Create draft
    response = client.post("/api/v1/receipts/", json={
        "reference": "R2",
        "supplier_id": str(uuid.uuid4()),
        "items": [{"product_id": str(test_data["product"].id), "quantity": 10}]
    }, headers=auth_headers)
    receipt_id = response.json()["id"]
    
    # Validate with invalid location
    response = client.post(f"/api/v1/receipts/{receipt_id}/validate", json={"location_id": str(uuid.uuid4())}, headers=auth_headers)
    assert response.status_code == 404
    
    # Verify stock (should not exist)
    db = SessionLocal()
    stock = db.query(Stock).filter_by(product_id=test_data["product"].id).first()
    assert stock is None
    db.close()

def test_delivery_atomic_rollback(auth_headers, test_data):
    # Setup initial stock
    db = SessionLocal()
    from app.services.stock import add_stock
    add_stock(db, test_data["product"].id, test_data["loc1"].id, 5)
    db.commit()
    db.close()
    
    # Create draft
    response = client.post("/api/v1/deliveries/", json={
        "reference": "D2",
        "source_location_id": str(test_data["loc1"].id),
        "items": [{"product_id": str(test_data["product"].id), "quantity": 10}] # More than available
    }, headers=auth_headers)
    delivery_id = response.json()["id"]
    
    # Validate - should fail with insufficient stock
    response = client.post(f"/api/v1/deliveries/{delivery_id}/validate", headers=auth_headers)
    assert response.status_code == 400
    
    # Verify stock (should remain 5)
    db = SessionLocal()
    stock = db.query(Stock).filter_by(product_id=test_data["product"].id, location_id=test_data["loc1"].id).first()
    assert stock.quantity == 5
    db.close()

def test_transfer_atomic_rollback(auth_headers, test_data):
    # Setup initial stock
    db = SessionLocal()
    from app.services.stock import add_stock
    add_stock(db, test_data["product"].id, test_data["loc1"].id, 5)
    db.commit()
    db.close()
    
    # Create draft
    response = client.post("/api/v1/transfers/", json={
        "reference": "T2",
        "source_location_id": str(test_data["loc1"].id),
        "destination_location_id": str(uuid.uuid4()), # Invalid dest
        "items": [{"product_id": str(test_data["product"].id), "quantity": 2}]
    }, headers=auth_headers)
    transfer_id = response.json()["id"]
    
    # Validate - should fail
    response = client.post(f"/api/v1/transfers/{transfer_id}/validate", headers=auth_headers)
    assert response.status_code == 404
    
    # Verify stock (should remain 5)
    db = SessionLocal()
    stock = db.query(Stock).filter_by(product_id=test_data["product"].id, location_id=test_data["loc1"].id).first()
    assert stock.quantity == 5
    db.close()

def test_adjustment_atomic_rollback(auth_headers, test_data):
    # Create draft
    response = client.post("/api/v1/adjustments/", json={
        "reference": "A2",
        "location_id": str(test_data["loc1"].id),
        "reason": "Test",
        "items": [{"product_id": str(test_data["product"].id), "physical_quantity": -5}] # Invalid quantity
    }, headers=auth_headers)
    adj_id = response.json()["id"]
    
    # Validate - should fail
    response = client.post(f"/api/v1/adjustments/{adj_id}/validate", headers=auth_headers)
    assert response.status_code == 400
    
    # Verify adjustment status (should still be DRAFT)
    db = SessionLocal()
    adj = db.query(Adjustment).filter_by(id=uuid.UUID(adj_id)).first()
    assert adj.status == "DRAFT"
    db.close()
