from decimal import Decimal

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from backend.app.categories.models import CategoryTable
from backend.app.products.models import ProductTable
from backend.app.shopping_lists.models import (
    ShoppingListItemTable,
    ShoppingListTable,
)
from backend.app.shopping_lists.schemas import (
    GetAllListResponse,
    ShoppingListDetailResponse,
    ShoppingListItemResponse,
    ShoppingListCreateRequest,
)


class ShoppingListService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_lists(self):
        rows = self.db.scalars(
            select(ShoppingListTable).order_by(ShoppingListTable.id)
        ).all()
        return [
            GetAllListResponse(
                id=row.id,
                name=row.name,
                created_at=row.created_at,
            )
            for row in rows
        ]

    def get_list_detail(self, shopping_list_id: int):
        shopping_list = self.db.get(ShoppingListTable, shopping_list_id)
        if shopping_list is None:
            return None

        statement = (
            select(ShoppingListItemTable, CategoryTable)
            .join(
                CategoryTable,
                ShoppingListItemTable.category_id == CategoryTable.id,
            )
            .where(
                ShoppingListItemTable.shopping_list_id == shopping_list_id
            )
            .order_by(ShoppingListItemTable.id)
        )
        rows = self.db.execute(statement).all()
        items = []
        estimated_total: Decimal | None = None
        checked_count = 0

        for list_item, category in rows:
            if list_item.is_checked:
                checked_count += 1
            if list_item.estimated_price is not None:
                item_total = (
                    list_item.quantity * list_item.estimated_price
                )
                estimated_total = (
                    item_total
                    if estimated_total is None
                    else estimated_total + item_total
                )

            items.append(
                ShoppingListItemResponse(
                    id=list_item.id,
                    shopping_list_id=list_item.shopping_list_id,
                    product_id=list_item.product_id,
                    product_name=list_item.name,
                    category_id=category.id,
                    category=category.name,
                    quantity=list_item.quantity,
                    unit=list_item.unit,
                    estimated_price=list_item.estimated_price,
                    image_url=list_item.image_url,
                    notes=list_item.notes,
                    is_checked=list_item.is_checked,
                )
            )

        return ShoppingListDetailResponse(
            id=shopping_list.id,
            name=shopping_list.name,
            items=items,
            checked_count=checked_count,
            total_count=len(items),
            estimated_total=estimated_total,
        )

    def add_item(self, shopping_list_id: int, request):
        shopping_list = self.db.get(ShoppingListTable, shopping_list_id)
        if shopping_list is None:
            return None

        product = self.db.get(ProductTable, request.product_id)
        if product is None:
            return None

        item = ShoppingListItemTable(
            shopping_list_id=shopping_list.id,
            product_id=product.id,
            name=product.name,
            category_id=product.category_id,
            estimated_price=None,
            quantity=request.quantity,
            unit=request.unit.value,
            image_url=request.image_url,
            notes=request.notes,
            is_checked=False,
        )
        self.db.add(item)
        self.db.commit()

        return self.get_list_detail(shopping_list_id)

    def uncheck_all(self, shopping_list_id: int):
        if self.db.get(ShoppingListTable, shopping_list_id) is None:
            return None

        self.db.execute(
            update(ShoppingListItemTable)
            .where(ShoppingListItemTable.shopping_list_id == shopping_list_id)
            .values(is_checked=False)
        )
        self.db.commit()
        return self.get_list_detail(shopping_list_id)

    def delete_item(self, shopping_list_id: int, item_id: int):
        item = self.db.get(ShoppingListItemTable, item_id)
        if item is None or item.shopping_list_id != shopping_list_id:
            return None

        self.db.delete(item)
        self.db.commit()

        return self.get_list_detail(shopping_list_id)

    def update_item(self, shopping_list_id, item_id, request):
        item = self.db.get(ShoppingListItemTable, item_id)
        if item is None or item.shopping_list_id != shopping_list_id:
            return None

        update_data = request.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(item, field, value)

        self.db.commit()

        return self.get_list_detail(shopping_list_id)


    def create_list(self, request):
    
        shopping_list = ShoppingListTable(
            name=request.name.strip()
        )

        self.db.add(shopping_list)
        self.db.commit()
        self.db.refresh(shopping_list)

        return shopping_list

    def delete_list(self, shopping_list_id):
        shopping_list = self.db.get(ShoppingListTable, shopping_list_id)

        if shopping_list is None:
            return False

        self.db.delete(shopping_list)
        self.db.commit()
        return True

    def update_list(self, shopping_list_id, request):
            shopping_list = self.db.get(ShoppingListTable, shopping_list_id)
            if shopping_list is None :
                return None
    
            update_data = request.model_dump(exclude_unset=True)

            if update_data.get("name") is not None:
                update_data["name"] = update_data["name"].strip()

            for field, value in update_data.items():
                setattr(shopping_list, field, value)
    
            self.db.commit()
    
            return shopping_list
