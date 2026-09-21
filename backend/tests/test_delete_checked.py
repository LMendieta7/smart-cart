from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.core.database import Base
from backend.app.categories.models import CategoryTable
from backend.app.shopping_lists.models import ShoppingListTable, ShoppingListItemTable
from backend.app.shopping_lists.services import ShoppingListService


def test_delete_checked_preserves_unchecked_items_and_other_lists():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        db.add(CategoryTable(id=1, name="Produce"))
        db.add_all([ShoppingListTable(id=1, name="First"), ShoppingListTable(id=2, name="Other"), ShoppingListTable(id=3, name="Empty")])
        for item_id, list_id, checked in [(1, 1, True), (2, 1, False), (3, 2, True)]:
            db.add(ShoppingListItemTable(id=item_id, shopping_list_id=list_id, product_id=item_id, name=f"Item {item_id}", category_id=1, is_checked=checked))
        db.commit()
        service = ShoppingListService(db)
        result = service.delete_checked(1)
        assert result.checked_count == 0
        assert result.total_count == 1
        assert [item.id for item in result.items] == [2]
        assert all(not item.is_checked for item in result.items)
        db.expire_all()
        assert db.get(ShoppingListItemTable, 1) is None
        assert db.get(ShoppingListItemTable, 2) is not None
        assert db.get(ShoppingListTable, 1) is not None
        assert db.get(ShoppingListItemTable, 3).is_checked
        assert service.delete_checked(1).checked_count == 0
        assert service.delete_checked(3).total_count == 0
        assert service.delete_checked(999) is None
