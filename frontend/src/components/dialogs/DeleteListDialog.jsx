import Alert from "@mui/material/Alert";
import useSaveAction from "../../hooks/useSaveAction";
import { 
    Box,
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function DeleteListDialog({selectedList, onClose, onDelete}) {
    const { save, isSaving, error } = useSaveAction();

   
    async function handleConfirmDelete() {
        await save(async () => { await onDelete(); onClose(); });
    }
    
    return (
        <Box>
        <Dialog
            open
            onClose={isSaving ? undefined : onClose}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
        >
            <DialogTitle align='center'>
                {`Delete '${selectedList.name}'`}
            </DialogTitle>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <DeleteIcon sx={{ fontSize: 64 }} color="error" />
            </Box>
            <DialogContent sx={{ pt: 1 }}>
            <DialogContentText
                id="delete-dialog-description"
                sx={{
                    textAlign: "center",
                    maxWidth: 320,
                    mx: "auto",
                }}
            >
                This will permanently delete this list and all its items. This action cannot be undone.
            </DialogContentText>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button disabled={isSaving} type="button" size="medium" onClick={onClose}>
                Cancel
            </Button>
            <Button disabled={isSaving}
                type="button"
                variant="contained"
                color="error"
                size="medium"
                onClick={handleConfirmDelete}
            >
                Delete
            </Button>
            </DialogActions>
        </Dialog>
        </Box>
    );
}

export default DeleteListDialog;
