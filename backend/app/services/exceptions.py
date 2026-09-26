class StockError(Exception):
    """Base class for stock mutation exceptions"""
    pass

class InsufficientStockError(StockError):
    """Raised when stock is lower than requested removal quantity"""
    pass

class InvalidQuantityError(StockError):
    """Raised when provided quantity is invalid (e.g., negative)"""
    pass

class ProductNotFoundError(StockError):
    """Raised when product does not exist"""
    pass

class LocationNotFoundError(StockError):
    """Raised when location does not exist"""
    pass
