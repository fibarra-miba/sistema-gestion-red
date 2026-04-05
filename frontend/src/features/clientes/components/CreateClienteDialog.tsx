import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreateClienteForm from "./CreateClienteForm";

type Cliente = {
  cliente_id: number;
  nombre_cliente?: string;
  apellido_cliente?: string;
  email_cliente?: string;
  dni?: string;
  dni_cliente?: string;
  telefono?: string;
  telefono_cliente?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
};

export default function CreateClienteDialog({
  open,
  onClose,
  cliente,
}: Props) {
  const isEditMode = !!cliente;

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
          {isEditMode ? "Editar cliente" : "Crear cliente"}

          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <CreateClienteForm
            cliente={cliente ?? undefined}
            onSuccess={handleSuccess}
          />
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
          {isEditMode
            ? "Cliente actualizado correctamente"
            : "Cliente creado correctamente"}
        </Alert>
      </Snackbar>
    </>
  );
}