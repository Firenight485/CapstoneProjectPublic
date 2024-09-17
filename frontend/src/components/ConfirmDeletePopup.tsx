import { Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";

// component used to confirm whenever a delete action takes place

interface deleteProps {
  onConfirm: () => void;  // callback for "Yes" to delte question
  open: boolean; 
  onClose: () => void;  // cleanup on close
  text: string;  // text of popup
}

export default function ConfirmDeletePopup({onConfirm, open, onClose, text}:deleteProps) {

  const handleClose = () => {
    onConfirm();
    onClose();
  }

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={onClose} 
      PaperProps={{
        sx: {
          height: '150px',
          width: '400px'
        }
      }}
    >
      <DialogContent>
        <Typography>
          {text}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleClose}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}