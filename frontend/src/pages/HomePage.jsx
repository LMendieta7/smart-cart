import { useCallback, useState, useEffect } from "react";
import ProductSearch from "../components/ProductSearch";
import ShoppingList from "../components/ShoppingList";
import ListSelectorSection from "../components/ListSelectorSection";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  addProductToShoppingList,
  deleteShoppingListItem,
  getShoppingListDetail,
  updateShoppingListItem,
  uncheckAllShoppingListItems,
  deleteCheckedShoppingListItems
} from "../services/shoppingListApi";

import { getAllCategories } from "../services/categoriesApi";


function HomePage() {
  const [selectedListId, setSelectedListId] = useState("");
  const [shoppingListDetail, setShoppingListDetail] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadShoppingListDetails() {
      if (!selectedListId) {
        setShoppingListDetail(null);
        return;
      }

      try {
        const listDetails = await getShoppingListDetail(selectedListId);
        setShoppingListDetail(listDetails);

      } catch (error) {
        console.error("Failed to load shopping list details:", error);
      }
    }

    loadShoppingListDetails();

  }, [selectedListId]);

  useEffect(() => {
    async function loadAllCategories() {
      try {
        const categoryList = await getAllCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }

    loadAllCategories();
  }, []);

  async function addProductToList(product) {
    if (!selectedListId) {
      return;
    }


    const itemRequest = {
      product_id: product.id,
      quantity: 1,
    };

    const updateDetail = await addProductToShoppingList(selectedListId, itemRequest);

    setShoppingListDetail(updateDetail);

    }


  const handleListSelect = useCallback((listId) => {
    setSelectedListId(listId);
    
  }, []);

  async function deleteItemFromList(itemId) {
    if (!selectedListId) {
        return;
      }
    const updateDetail = await deleteShoppingListItem(selectedListId, itemId);
    setShoppingListDetail(updateDetail);
  }

  async function handleUpdateListItem(itemId, request){
    if (!selectedListId) {
        return;
    }
    const updateItemList = await updateShoppingListItem(selectedListId, itemId, request)
    setShoppingListDetail(updateItemList);
  }

  async function handleDeleteChecked(listId) {
    const updatedList = await deleteCheckedShoppingListItems(listId);
    setShoppingListDetail((current) =>
      current?.id === updatedList.id ? updatedList : current
    );
  }

  async function handleUncheckAll() {
    if (!selectedListId) return;
    const updatedList = await uncheckAllShoppingListItems(selectedListId);
    setShoppingListDetail((current) =>
      current?.id === updatedList.id ? updatedList : current
    );
  }

  return (
    <>
      <Header totalItemsCount={shoppingListDetail ? shoppingListDetail.total_count : "0"}
              checkedCount = {shoppingListDetail ? shoppingListDetail.checked_count : "0"}
      />
      <Box
        component="main"
        sx={{
          display: "grid",
          gap: { xs: 2, sm: 3 },
          p: { xs: 1, sm: 2 },
        }}
      > 
        <Stack spacing={0.7}>
        <ListSelectorSection 
          onSelectList={handleListSelect}
          selectedListId={selectedListId}
          shoppingListDetail={shoppingListDetail}
          onUncheckAll={handleUncheckAll}
          onDeleteChecked={handleDeleteChecked}
        />
        {selectedListId && (
          <ProductSearch onAddProductToList={addProductToList} />
        )}
       </Stack>
  
        {shoppingListDetail ? (
          <ShoppingList
            items={shoppingListDetail.items}
            onDeleteItem={deleteItemFromList}
            onUpdateListItem={handleUpdateListItem}
            categories={categories}
          />
        ) : (
          <Typography align="center" sx={{ color: "darkGreen", py: 6 }}>
            Create a shopping list to get started.
          </Typography>
        )}
      </Box>
    </>
    
  );
}

export default HomePage;
