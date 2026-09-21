import { useCallback, useState, useEffect } from "react";
import ProductSearch from "../components/ProductSearch";
import ShoppingList from "../components/ShoppingList";
import ListSelectorSection from "../components/ListSelectorSection";
import Header from "../components/Header";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  addProductToShoppingList,
  deleteShoppingListItem,
  getShoppingListDetail,
  updateShoppingListItem,
  uncheckAllShoppingListItems,
  deleteCheckedShoppingListItems,
  clearShoppingList
} from "../services/shoppingListApi";

import { createListRequests } from "../services/listRequests";

import { getAllCategories } from "../services/categoriesApi";


function HomePage() {
  const [selectedListId, setSelectedListId] = useState("");
  const [shoppingListDetail, setShoppingListDetail] = useState(null);
  const [categories, setCategories] = useState([]);

  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [requests] = useState(createListRequests);

  useEffect(() => {
    if (!selectedListId) return;
    return requests.load(
      selectedListId,
      () => getShoppingListDetail(selectedListId),
      setShoppingListDetail,
      (error) => setLoadError(error.message),
    );
  }, [selectedListId, reloadKey, requests]);

  function mutateList(listId, operation) {
    return requests.mutate(listId, operation, setShoppingListDetail);
  }

  useEffect(() => {
    async function loadAllCategories() {
      try {
        const categoryList = await getAllCategories();
        setCategories(categoryList);
      } catch (error) {
        setLoadError(`Could not load categories: ${error.message}`);
      }
    }

    loadAllCategories();
  }, [reloadKey]);

  const handleListSelect = useCallback((listId) => {
    if (!requests.select(listId)) return;
    setShoppingListDetail(null);
    setLoadError("");
    setSelectedListId(listId);
  }, [requests]);

  function addProductToList(product) {
    return mutateList(selectedListId, () => addProductToShoppingList(selectedListId, { product_id: product.id, quantity: 1 }));
  }

  function deleteItemFromList(itemId) {
    return mutateList(selectedListId, () => deleteShoppingListItem(selectedListId, itemId));
  }

  function handleUpdateListItem(itemId, request) {
    return mutateList(selectedListId, () => updateShoppingListItem(selectedListId, itemId, request));
  }

  function handleDeleteChecked(listId) {
    return mutateList(listId, () => deleteCheckedShoppingListItems(listId));
  }

  function handleClearList(listId) {
    return mutateList(listId, () => clearShoppingList(listId));
  }

  function handleUncheckAll() {
    return mutateList(selectedListId, () => uncheckAllShoppingListItems(selectedListId));
  }

  return (
    <>
      <Header estimatedTotal={shoppingListDetail?.estimated_total}
              totalItemsCount={shoppingListDetail ? shoppingListDetail.total_count : "0"}
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
        {loadError && <Alert severity="error" action={<Button onClick={() => { setLoadError(""); setReloadKey((key) => key + 1); }}>Retry</Button>}>{loadError}</Alert>}
        <Stack spacing={0.7}>
        <ListSelectorSection 
          onSelectList={handleListSelect}
          selectedListId={selectedListId}
          shoppingListDetail={shoppingListDetail}
          onUncheckAll={handleUncheckAll}
          onDeleteChecked={handleDeleteChecked}
          onClearList={handleClearList}
        />
        {shoppingListDetail && (
          <ProductSearch key={shoppingListDetail.id} onAddProductToList={addProductToList} />
        )}
       </Stack>
  
        {shoppingListDetail ? (
          <ShoppingList
            key={shoppingListDetail.id}
            items={shoppingListDetail.items}
            onDeleteItem={deleteItemFromList}
            onUpdateListItem={handleUpdateListItem}
            categories={categories}
          />
        ) : (
          <Typography align="center" sx={{ color: "darkGreen", py: 6 }}>
            {selectedListId ? (loadError ? "Could not load this list. Use Retry above." : "Loading shopping list…") : "Create a shopping list to get started."}
          </Typography>
        )}
      </Box>
    </>
    
  );
}

export default HomePage;
