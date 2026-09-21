import {
    createShoppingList,
    getAllShoppingLists,
    updateShoppingList,
    deleteShoppingList
} from "../services/shoppingListApi";
import { useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import DeselectIcon from "@mui/icons-material/Deselect";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";


import DeleteCheckedDialog from "./dialogs/DeleteCheckedDialog";
import ListDialog from "./dialogs/ListDialog";
import DeleteListDialog from "./dialogs/DeleteListDialog";
import ListIcon from '@mui/icons-material/List';

function ListSelectorSection({ selectedListId, onSelectList, shoppingListDetail, onUncheckAll, onDeleteChecked }){
    const [deleteCheckedTarget, setDeleteCheckedTarget] = useState(null);
    const [isUnchecking, setIsUnchecking] = useState(false);
    const [uncheckError, setUncheckError] = useState("");

    async function handleUncheckAll() {
        if (isUnchecking) return;
        handleCloseMenu();
        setIsUnchecking(true);
        setUncheckError("");
        try {
            await onUncheckAll();
        } catch (error) {
            setUncheckError(error.message);
        } finally {
            setIsUnchecking(false);
        }
    }
    const [shoppingLists, setShoppingLists] = useState([]);
    const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);
    const [isEditListDialogOpen, setIsEditListDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);

    function handleOpenMenu(event){
        setAnchorEl(event.currentTarget);
    }

    function handleCloseMenu(){
        setAnchorEl(null);
    }

    function handleListChange(event) {
        const newListId = event.target.value;
        onSelectList(newListId);
    }
        useEffect(() => {
        async function loadShoppingLists() {
            const lists = await getAllShoppingLists();

            setShoppingLists(lists);
            if (lists.length > 0) {
                onSelectList(lists[0].id);
            }

        }

        loadShoppingLists();
    }, [onSelectList]);

    function handleOpenCreateListDialog(){
        setIsCreateListDialogOpen(true);
        handleCloseMenu();
    }

    function handleCloseCreateListDialog(){
        setIsCreateListDialogOpen(false);
    }

    function handleOpenEditListDialog(){
        setIsEditListDialogOpen(true);
        handleCloseMenu();
    }

    function handleCloseEditListDialog(){
        setIsEditListDialogOpen(false)
    }

    // Delete list dialog handle
     const handleOpenDeleteListDialog = () => {
        setIsDeleteDialogOpen(true);
        handleCloseMenu();
    };

    const handleCloseDeleteListDialog = () => {
        setIsDeleteDialogOpen(false);
    };
   
   
    async function handleCreateShoppingList(request) {

        const createdList = await createShoppingList(request);

        setShoppingLists((currentLists) => [
        ...currentLists,
        createdList,
        ]);
        onSelectList(createdList.id)

    }

    async function handleUpdateShoppingList(request) {
        const updatedList = await updateShoppingList(selectedListId, request);

        setShoppingLists((currentLists) =>
            currentLists.map((list) =>
                list.id === updatedList.id ? updatedList : list
            )
        );
    }

    const selectedList = shoppingLists.find((list) => list.id === selectedListId) 

     async function handleDeleteShoppingList() {
        await deleteShoppingList(selectedListId);

        const remainingLists = shoppingLists.filter(
            (list) => list.id !== selectedListId
        );

        setShoppingLists(remainingLists);
        onSelectList(remainingLists[0]?.id ?? "");
    }

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex:1 }}>
            <FormControl size="small" sx={{ width: {
                                                xs: "81%",
                                                sm: "45%",
                                            },

                                            minWidth: 0,
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#c9d0cb",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "darkgreen",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "darkgreen",
                                                },
                                            },
                                        }}
            >
                <Select
                    labelId="shopping-list-label"
                    value={selectedListId}
                    onChange={handleListChange}
                >
                {shoppingLists.map((list) => (
                    <MenuItem key={list.id} value={list.id}>
                        {list.name}
                    </MenuItem>
                ))}
                </Select>

            </FormControl>
            <IconButton size="small" onClick={handleOpenMenu}>
              <MoreVertIcon fontSize="small"/>
            </IconButton>
            </Box>
            <Fab
                size="small"
                onClick={handleOpenCreateListDialog}
                aria-label="Add shopping list"
                sx={{
                    flexShrink: 0,
                    bgcolor: "#0B5D1E",
                    color: "#FFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                    "&:hover": {
                        bgcolor: "#094A18",
                    },
                }}
            >
            <AddIcon sx={{ fontSize: 25 }} />
            </Fab>
            {isCreateListDialogOpen && (
                <ListDialog
                    onClose={handleCloseCreateListDialog}
                    onSave={handleCreateShoppingList}
                />
            )}
            {isEditListDialogOpen && selectedList &&(
                <ListDialog
                    list={selectedList}
                    onClose={handleCloseEditListDialog}
                    onSave={handleUpdateShoppingList}
                />
            )}
            {isDeleteDialogOpen && (
                <DeleteListDialog
                    selectedList={selectedList}
                    onClose={handleCloseDeleteListDialog}
                    onDelete={handleDeleteShoppingList}                    
                />
            )}
            
            {deleteCheckedTarget && (
                <DeleteCheckedDialog
                    target={deleteCheckedTarget}
                    onClose={() => setDeleteCheckedTarget(null)}
                    onDelete={onDeleteChecked}
                />
            )}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                slotProps={{
                    list: {
                        sx: {
                            py: 0.75,
                            "& .MuiMenuItem-root": {
                                minHeight: 45,
                                py: 0.75,
                            },
                        },
                    },
                }}
            >
                <MenuItem onClick={handleOpenEditListDialog}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" sx={{color:"darkGreen"}}></EditIcon>
                    </ListItemIcon>
                    <ListItemText>Edit list</ListItemText>
                </MenuItem>

                <MenuItem
                    onClick={handleUncheckAll}
                    disabled={isUnchecking || !selectedListId || shoppingListDetail?.id !== selectedListId || !shoppingListDetail?.checked_count}
                >
                    <ListItemIcon>
                        <DeselectIcon fontSize="small" sx={{color:"darkGreen"}}></DeselectIcon>
                    </ListItemIcon>
                    <ListItemText>Uncheck all</ListItemText>
                </MenuItem>

                 <MenuItem
                    disabled={isUnchecking || !selectedListId || shoppingListDetail?.id !== selectedListId || !shoppingListDetail?.checked_count}
                    onClick={() => {
                        setDeleteCheckedTarget({ id: selectedListId, name: shoppingListDetail.name, count: shoppingListDetail.checked_count });
                        handleCloseMenu();
                    }}
                 >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" sx={{color:"darkGreen"}}></DeleteIcon>
        
                    </ListItemIcon>
                    <ListItemText>Delete checked</ListItemText>
                </MenuItem>
                <Divider sx={{ mx: 0.75, my: 0.25 }} />
                <MenuItem >
                    <ListItemIcon>
                        <ListIcon fontSize="small" sx={{color:"darkGreen"}}></ListIcon>
                    </ListItemIcon>
                    <ListItemText>Clear list</ListItemText>
                </MenuItem>

                <Divider sx={{ mx: 0.75, my: 0.25 }} />
                
                <MenuItem onClick={handleOpenDeleteListDialog}>
                    <ListItemIcon>
                       <DeleteIcon fontSize="small" color="error"></DeleteIcon>
                    </ListItemIcon>
                    <ListItemText sx={{color:"error.main"}}>Delete list</ListItemText>
                </MenuItem>

            </Menu>
            <Snackbar open={Boolean(uncheckError)} onClose={() => setUncheckError("")}>
                <Alert severity="error" onClose={() => setUncheckError("")}>
                    {uncheckError}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ListSelectorSection;
