import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export default function DeleteCheckedDialog({ target, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");
    try {
      await onDelete(target.id);
      onClose();
    } catch (error) {
      setError(error.message);
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open onClose={isDeleting ? undefined : onClose} aria-labelledby="delete-checked-title" aria-describedby="delete-checked-description">
      <DialogTitle id="delete-checked-title">
        Delete {target.count} checked {target.count === 1 ? "item" : "items"}?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-checked-description">
          This will permanently remove the checked items from “{target.name}”. Unchecked items will stay in the list.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>Cancel</Button>
        <Button onClick={handleDelete} disabled={isDeleting} color="error" variant="contained">
          {isDeleting ? "Deleting…" : "Delete checked"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
