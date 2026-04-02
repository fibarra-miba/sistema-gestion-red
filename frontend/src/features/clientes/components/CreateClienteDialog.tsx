import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import CreateClienteForm from "./CreateClienteForm";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CreateClienteDialog = ({ open, onClose }: Props) => {
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Nuevo cliente</DialogTitle>

        <DialogContent>
          <CreateClienteForm onSuccess={handleSuccess} />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" variant="filled">
          Cliente creado correctamente
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateClienteDialog;