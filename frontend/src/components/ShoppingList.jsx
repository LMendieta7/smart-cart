import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import EditItemDialog from "./dialogs/EditItemDialog";

import { useState } from "react";

function ShoppingList({ items, onDeleteItem, onUpdateListItem, categories }) {

    const [error, setError] = useState("");
    const [pendingItems, setPendingItems] = useState(new Set());
    const [selectedItem, setSelectedItem] = useState(null);
   

    function handleClose() {
        setSelectedItem(null);
    }
    
    async function handleCheckbox(itemId, checked){
        
        setPendingItems((current) => new Set(current).add(itemId));
        setError("");
        try {
            await onUpdateListItem(itemId, {is_checked: checked});
        } catch (error) {
            setError(error.message);
        } finally {
            setPendingItems((current) => { const next = new Set(current); next.delete(itemId); return next; });
        }
    }

    return (
        <Box
            component="section"
            sx={{
                minWidth: 0,
               
            }}
        >
            {error && <Alert severity="error">{error}</Alert>}
            <List
                sx={{
                    p: 0,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "rgba(11, 93, 30, 0.22)",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
            >
                {items.map((item) => (
                    <ListItem
                        key={item.id}
                        alignItems="flex-start"
                        sx={{
                            p: 0,
                            "&:not(:last-of-type)": {
                                borderBottom: "1px solid",
                                borderColor: "rgba(11, 93, 30, 0.14)",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                minWidth: 0,
                                gap: 1,
                                px: 1,
                                py: 0.65,
                                transition: "background-color 160ms ease",
                                "&:hover": {
                                    bgcolor: "rgba(11, 93, 30, 0.035)",
                                },
                            }}
                        >
                            <Checkbox
                                disabled={pendingItems.has(item.id)}
                                checked={item.is_checked}
                                onChange={(event) => handleCheckbox(item.id, event.target.checked)}
                                size="small"
                                sx={{
                                    p: 0.5,
                                    ml: -0.5,
                                    mt: 0,
                                    "& .MuiSvgIcon-root": {
                                        fontSize: 25,
                                    },
                                }}
                            />

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    noWrap
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {item.product_name}
                                </Typography>

                                <Typography
                                    noWrap
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: "block",
                                        mt: 0.1,
                                        fontStyle: "italic",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Qty: {Number(item.quantity)} {item.unit}
                                    {item.estimated_price != null &&
                                        ` • $${item.estimated_price}`}
                                    {item.notes &&` •  ${item.notes}`}
                                </Typography>
                              
                            </Box>
                                <IconButton
                                    aria-label={`Edit ${item.product_name}`}
                                    onClick={()=> setSelectedItem(item)}
                                    size="small"
                                    sx={{
                                        p: 0.5,
                                        color: "#0B5D1E",
                                        "&:hover": {
                                            bgcolor: "rgba(11, 93, 30, 0.08)",
                                        },
                                    }}
                                    >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                        </Box>
                    </ListItem>
                    
                ))}
            </List>
            { selectedItem && (
            <EditItemDialog
                onClose={handleClose}
                item={selectedItem}
                onDeleteItem={onDeleteItem}
                onUpdateListItem={onUpdateListItem}
                categories={categories}
            />
            )}
        </Box>
    );
}

export default ShoppingList;
