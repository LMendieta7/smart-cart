from fastapi import APIRouter, Depends, HTTPException, Response, status

from backend.app.core.dependencies import get_shopping_list_service
from backend.app.shopping_lists.schemas import (
    GetAllListResponse,
    ShoppingListDetailResponse,
    ShoppingListItemCreateRequest,
    ShoppingListItemUpdateRequest,
    ShoppingListCreateRequest,
    ShoppingListUpdateRequest
)
from backend.app.shopping_lists.services import ShoppingListService


router = APIRouter()


@router.get("/shopping-lists", response_model=list[GetAllListResponse])
def get_all_shopping_lists(
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    return service.get_all_lists()


@router.get(
    "/shopping-lists/{shopping_list_id}",
    response_model=ShoppingListDetailResponse,
)
def get_shopping_list_detail(
    shopping_list_id: int,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    list_detail = service.get_list_detail(shopping_list_id)
    if list_detail is None:
        raise HTTPException(
            status_code=404,
            detail="Shopping list not found",
        )
    return list_detail


@router.post(
    "/shopping-lists/{shopping_list_id}/items",
    response_model=ShoppingListDetailResponse,
)
def add_shopping_list_item(
    request: ShoppingListItemCreateRequest,
    shopping_list_id: int,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    list_detail = service.add_item(shopping_list_id, request)
    if list_detail is None:
        raise HTTPException(
            status_code=404,
            detail="Shopping list or product not found",
        )
    return list_detail


@router.delete(
    "/shopping-lists/{shopping_list_id}/items/{item_id}",
    response_model=ShoppingListDetailResponse,
)
def delete_shopping_list_item(
    shopping_list_id: int,
    item_id: int,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    list_detail = service.delete_item(shopping_list_id, item_id)
    if list_detail is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return list_detail


@router.patch(
    "/shopping-lists/{shopping_list_id}/items/{item_id}",
    response_model=ShoppingListDetailResponse,
)
def update_shopping_list_item(
    shopping_list_id: int,
    item_id: int,
    request: ShoppingListItemUpdateRequest,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    list_detail = service.update_item(shopping_list_id, item_id, request)
    if list_detail is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return list_detail

@router.post("/shopping-lists" , response_model=GetAllListResponse)
def create_shopping_list(
    request: ShoppingListCreateRequest,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    return service.create_list(request)


@router.delete(
    "/shopping-lists/{shopping_list_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_list(
    shopping_list_id: int,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    deleted = service.delete_list(shopping_list_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/shopping-lists/{shopping_list_id}",
    response_model=GetAllListResponse,
)
def update_shopping_list(
    shopping_list_id: int,
    request: ShoppingListUpdateRequest,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    shopping_list = service.update_list(shopping_list_id, request)
    if shopping_list is None:
        raise HTTPException(status_code=404, detail="List not found")

    return shopping_list

@router.post(
    "/shopping-lists/{shopping_list_id}/uncheck-all",
    response_model=ShoppingListDetailResponse,
)
def uncheck_all_items(
    shopping_list_id: int,
    service: ShoppingListService = Depends(get_shopping_list_service),
):
    list_detail = service.uncheck_all(shopping_list_id)
    if list_detail is None:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    return list_detail
