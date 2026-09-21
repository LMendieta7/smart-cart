from sqlalchemy import func, select
from backend.app.core.errors import commit_changes
from sqlalchemy.orm import Session

from backend.app.categories.models import CategoryTable
from backend.app.products.models import ProductTable
from backend.app.products.schemas import ProductResponse


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_product_by_exact_name(self, product_name: str):
        statement = (
            select(ProductTable, CategoryTable)
            .join(CategoryTable, ProductTable.category_id == CategoryTable.id)
            .where(
                func.lower(ProductTable.name)
                == product_name.lower().strip()
            )
        )
        row = self.db.execute(statement).first()
        if row is None:
            return None

        product, category = row
        return ProductResponse(
            id=product.id,
            name=product.name,
            category=category.name,
        )

    def search_products_by_name(self, query: str):
        statement = (
            select(ProductTable, CategoryTable)
            .join(CategoryTable, ProductTable.category_id == CategoryTable.id)
            .where(ProductTable.name.ilike(f"%{query.strip()}%"))
            .order_by(ProductTable.name)
            .limit(50)
        )
        rows = self.db.execute(statement).all()
        return [
            ProductResponse(
                id=product.id,
                name=product.name,
                category=category.name,
            )
            for product, category in rows
        ]

    def create_product(self, request):
        category = self.db.get(CategoryTable, request.category_id)
        if category is None:
            return None

        product = ProductTable(
            name=request.name,
            category_id=category.id,
        )
        self.db.add(product)
        commit_changes(self.db, "A product with this name already exists, or this product is still used by a shopping list.")

        return ProductResponse(
            id=product.id,
            name=product.name,
            category=category.name,
        )

    def delete_product(self, product_id):
        product = self.db.get(ProductTable, product_id)
        if product is None:
            return None

        self.db.delete(product)
        commit_changes(self.db, "A product with this name already exists, or this product is still used by a shopping list.")
        return product

    def update_product(self, product_id, request):
        product = self.db.get(ProductTable, product_id)
        if product is None:
            return None

        update_data = request.model_dump(exclude_unset=True)
        if "category_id" in update_data:
            category = self.db.get(CategoryTable, update_data["category_id"])
            if category is None:
                return None

        for field, value in update_data.items():
            setattr(product, field, value)

        commit_changes(self.db, "A product with this name already exists, or this product is still used by a shopping list.")
        self.db.refresh(product)
        return product
