from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, Field
from backend.app.core.validation import RequestModel, UpdateRequestModel


class ItemUnit(StrEnum):
    EACH = "each"
    PACK = "pack"
    POUND = "lb"
    OUNCE = "oz"
    KILOGRAM = "kg"
    GRAM = "g"
    LITER = "L"
    MILLILITER = "mL"
    GALLON = "gallon"
    DOZEN = "dozen"


class ShoppingListItemCreateRequest(RequestModel):
    product_id: int
    quantity: Decimal = Field(default=Decimal("1.00"), gt=0, max_digits=10, decimal_places=2)
    unit: ItemUnit = ItemUnit.EACH
    image_url: str | None = None
    notes: str | None = None


class ShoppingListItemResponse(BaseModel):
    id: int
    shopping_list_id: int
    product_id: int
    product_name: str
    category_id: int
    category: str
    quantity: Decimal
    unit: ItemUnit
    estimated_price: Decimal | None
    image_url: str | None
    notes: str | None
    is_checked: bool


class GetAllListResponse(BaseModel):
    id: int
    name: str
    created_at: datetime


class ShoppingListDetailResponse(BaseModel):
    id: int
    name: str
    items: list[ShoppingListItemResponse]
    checked_count: int
    total_count: int
    estimated_total: Decimal | None


class ShoppingListItemUpdateRequest(UpdateRequestModel):
    name: str | None = Field(default=None, min_length=1, max_length=180)
    category_id: int | None = Field(default=None, ge=1)
    quantity: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    unit: ItemUnit | None = None
    estimated_price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    image_url: str | None = None
    notes: str | None = None
    is_checked: bool | None = None

class ShoppingListItemMutationResponse(BaseModel):
    message: str
    list_id: int
    list_item_id: int
    item_name: str

class ShoppingListCreateRequest(RequestModel):
    name: str = Field(min_length=1, max_length=180)

class ShoppingListUpdateRequest(RequestModel):
    name: str = Field(min_length=1, max_length=180)
