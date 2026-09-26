from pydantic import BaseModel
import uuid

class DeliveryValidate(BaseModel):
    pass # No location_id needed because it's in the Delivery model
