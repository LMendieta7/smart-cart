from pydantic import BaseModel, Field
from backend.app.core.validation import RequestModel, UpdateRequestModel


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str


class ProductMutationResponse(BaseModel):
    message: str
    product_id: int
    product_name: str


class ProductCreateRequest(RequestModel):
    name: str = Field(min_length=1, max_length=180)
    category_id: int


class ProductUpdateRequest(UpdateRequestModel):
    name: str | None = Field(default=None, min_length=1, max_length=180)
    category_id: int | None = None
