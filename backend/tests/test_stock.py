import pytest
import uuid
from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.db.session import engine, SessionLocal
from app.models.product import Category, Product
from app.models.location import Warehouse, Location
from app.models.stock import Stock
from app.services.stock import add_stock, remove_stock, set_stock, transfer_stock_core
from app.services.exceptions import InsufficientStockError, InvalidQuantityError

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_data(db: Session):
    cat = Category(name="Test Cat")
    prod = Product(name="Test Prod", sku="SKU1", category=cat)
    wh = Warehouse(name="WH1", code="WH1")
    loc1 = Location(name="L1", code="L1", warehouse=wh)
    loc2 = Location(name="L2", code="L2", warehouse=wh)
    db.add_all([cat, prod, wh, loc1, loc2])
    db.commit()
    return {"product": prod, "loc1": loc1, "loc2": loc2}

@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_add_remove_stock(db, test_data):
    p_id = test_data["product"].id
    l_id = test_data["loc1"].id
    
    add_stock(db, p_id, l_id, 10)
    stock = db.query(Stock).filter_by(product_id=p_id, location_id=l_id).first()
    assert stock.quantity == 10
    
    remove_stock(db, p_id, l_id, 4)
    assert stock.quantity == 6

def test_insufficient_stock_fails(db, test_data):
    p_id = test_data["product"].id
    l_id = test_data["loc1"].id
    
    add_stock(db, p_id, l_id, 5)
    with pytest.raises(InsufficientStockError):
        remove_stock(db, p_id, l_id, 10)

def test_negative_stock_prevented(db, test_data):
    p_id = test_data["product"].id
    l_id = test_data["loc1"].id
    
    add_stock(db, p_id, l_id, 5)
    # Should not be able to remove more
    with pytest.raises(InsufficientStockError):
        remove_stock(db, p_id, l_id, 6)
    
    stock = db.query(Stock).filter_by(product_id=p_id, location_id=l_id).first()
    assert stock.quantity == 5

def test_set_stock(db, test_data):
    p_id = test_data["product"].id
    l_id = test_data["loc1"].id
    
    set_stock(db, p_id, l_id, 20)
    stock = db.query(Stock).filter_by(product_id=p_id, location_id=l_id).first()
    assert stock.quantity == 20
    
    with pytest.raises(InvalidQuantityError):
        set_stock(db, p_id, l_id, -1)

def test_transfer_stock(db, test_data):
    p_id = test_data["product"].id
    l1_id = test_data["loc1"].id
    l2_id = test_data["loc2"].id
    
    add_stock(db, p_id, l1_id, 10)
    transfer_stock_core(db, p_id, l1_id, l2_id, 4)
    
    s1 = db.query(Stock).filter_by(product_id=p_id, location_id=l1_id).first()
    s2 = db.query(Stock).filter_by(product_id=p_id, location_id=l2_id).first()
    
    assert s1.quantity == 6
    assert s2.quantity == 4

from app.services.exceptions import InsufficientStockError, InvalidQuantityError, LocationNotFoundError

# ... existing tests ...

def test_transfer_atomic_rollback(db, test_data):
    p_id = test_data["product"].id
    l1_id = test_data["loc1"].id
    # Use a non-existent UUID for destination
    invalid_l_id = uuid.uuid4()
    
    add_stock(db, p_id, l1_id, 10)
    db.commit() # Commit the initial stock addition
    
    # Attempt transfer to invalid location - source removal succeeds, destination add fails.
    # Should rollback the source removal.
    with pytest.raises(LocationNotFoundError):
        transfer_stock_core(db, p_id, l1_id, invalid_l_id, 4)
        
    s1 = db.query(Stock).filter_by(product_id=p_id, location_id=l1_id).first()
    
    # Should be unchanged (10)
    assert s1 is not None
    assert s1.quantity == 10
