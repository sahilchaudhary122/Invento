import pytest
from app.db.base_class import Base
from app.db.session import engine
import app.models  # This triggers the imports in __init__.py

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_models_registered_in_metadata():
    # Verify all expected tables are in Base.metadata
    expected_tables = {
        "user", "category", "product", "warehouse", "location", 
        "stock", "reorder_rule", "supplier", 
        "receipt", "receipt_item", "delivery", "delivery_item", 
        "transfer", "transfer_item", "adjustment", "adjustment_item", 
        "stock_ledger"
    }
    
    registered_tables = set(Base.metadata.tables.keys())
    
    for table in expected_tables:
        assert table in registered_tables, f"Table {table} not found in Base.metadata"

def test_model_creation():
    # Basic creation test
    from app.models.product import Category
    from app.db.session import SessionLocal
    
    session = SessionLocal()
    cat = Category(name="Test Category")
    session.add(cat)
    session.commit()
    session.refresh(cat)
    
    assert cat.name == "Test Category"
    assert cat.id is not None
    session.close()
