"""API regressions. Set SMART_CART_TEST_POSTGRES=1 for an isolated PostgreSQL schema."""
import os
from decimal import Decimal
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.main import create_app
from backend.app.core.database import Base
from backend.app.core.config import database_config
from backend.app.core.dependencies import get_db
from backend.app.categories.models import CategoryTable
from backend.app.products.models import ProductTable
from backend.app.shopping_lists.models import ShoppingListTable, ShoppingListItemTable


@pytest.fixture
def client():
    postgres = os.getenv("SMART_CART_TEST_POSTGRES") == "1"
    if postgres:
        engine = create_engine(database_config.url)
        schema = "test_reliability_" + uuid4().hex
        with engine.begin() as conn:
            conn.exec_driver_sql(f'CREATE SCHEMA "{schema}"')
        test_engine = engine.execution_options(schema_translate_map={None: schema})
    else:
        engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        @event.listens_for(engine, "connect")
        def enable_foreign_keys(conn, record):
            conn.execute("PRAGMA foreign_keys=ON")
        test_engine = engine
    try:
        Base.metadata.create_all(test_engine)
        with Session(test_engine) as db:
            db.add(CategoryTable(id=1, name="Produce"))
            db.commit()
            db.add_all([ProductTable(id=i, name=f"Product {i}", category_id=1) for i in range(1, 4)])
            db.add_all([ShoppingListTable(id=1, name="Weekly"), ShoppingListTable(id=2, name="Other")])
            db.commit()
            db.add_all([ShoppingListItemTable(id=i, shopping_list_id=1 if i < 3 else 2, product_id=i, name=f"Product {i}", category_id=1, estimated_price=2, is_checked=i != 2) for i in range(1, 4)])
            db.commit()
        app = create_app()
        def override_db():
            with Session(test_engine) as db:
                yield db
        app.dependency_overrides[get_db] = override_db
        with TestClient(app, raise_server_exceptions=False) as test_client:
            yield test_client
    finally:
        if postgres:
            with engine.begin() as conn:
                conn.exec_driver_sql(f'DROP SCHEMA "{schema}" CASCADE')
        engine.dispose()


@pytest.mark.parametrize("body", [{"name": None}, {"name": "   "}, {"name": "x" * 181}])
def test_invalid_list_names(client, body):
    assert client.post("/api/shopping-lists", json=body).status_code == 422


@pytest.mark.parametrize("body", [{"quantity": None}, {"unit": None}, {"name": " "}, {"is_checked": None}, {"category_id": None}, {"quantity": 0}, {"quantity": "100000000"}, {"estimated_price": "1.001"}])
def test_invalid_item_updates(client, body):
    assert client.patch("/api/shopping-lists/1/items/1", json=body).status_code == 422
    assert client.get("/api/shopping-lists/1").json()["total_count"] == 2


def test_duplicate_list_and_item_are_conflicts(client):
    assert client.post("/api/shopping-lists", json={"name": " Weekly "}).status_code == 409
    response = client.post("/api/shopping-lists/1/items", json={"product_id": 1})
    assert response.status_code == 409
    assert "already in the list" in response.json()["detail"]
    assert client.get("/api/shopping-lists/1").json()["total_count"] == 2


def test_invalid_category_and_referenced_product(client):
    assert client.patch("/api/shopping-lists/1/items/1", json={"category_id": 999}).status_code == 409
    assert client.delete("/api/products/1").status_code == 409
    assert client.get("/api/shopping-lists/1").json()["items"][0]["category_id"] == 1


def test_clear_preserves_list_catalog_and_other_lists(client):
    response = client.delete("/api/shopping-lists/1/items")
    assert response.status_code == 200
    assert response.json()["items"] == []
    assert response.json()["estimated_total"] is None
    assert client.get("/api/shopping-lists/2").json()["total_count"] == 1
    assert len(client.get("/api/products/search?q=Product").json()) == 3
    assert client.delete("/api/shopping-lists/1/items").status_code == 200
    assert client.delete("/api/shopping-lists/999/items").status_code == 404


def test_optional_price_can_be_cleared_and_total_recalculated(client):
    response = client.patch("/api/shopping-lists/1/items/1", json={"estimated_price": None})
    assert response.status_code == 200
    assert response.json()["items"][0]["estimated_price"] is None
    assert Decimal(response.json()["estimated_total"]) == Decimal("2.00")


def test_product_validation_and_duplicate_rename(client):
    assert client.patch("/api/products/1", json={"name": None}).status_code == 422
    assert client.post("/api/products/", json={"name": " ", "category_id": 1}).status_code == 422
    assert client.patch("/api/products/1", json={"name": "Product 2"}).status_code == 409
