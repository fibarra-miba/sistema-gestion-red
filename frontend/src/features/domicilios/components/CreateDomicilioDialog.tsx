import { useEffect, useState } from "react";
import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreateDomicilioForm from "./CreateDomicilioForm";

type Props = {
  open: boolean;
  onClose: () => void;
  clienteId: number;
};

export default function CreateDomicilioDialog({
  open,
  onClose,
  clienteId,
}: Props) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSnackbarOpen(false);
  }, [open]);

  const handleSuccess = () => {
    setSnackbarOpen(true);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          Nuevo domicilio

          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <CreateDomicilioForm clienteId={clienteId} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Domicilio creado correctamente
        </Alert>
      </Snackbar>
    </>
  );
}