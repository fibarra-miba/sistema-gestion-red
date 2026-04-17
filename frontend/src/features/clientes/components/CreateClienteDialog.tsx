import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useNotifications } from "../../../components/ui/notifications/useNotifications";
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
  const { success } = useNotifications();
  const isEditMode = !!cliente;

  const handleSuccess = () => {
    success(
      isEditMode
        ? "Cliente actualizado correctamente."
        : "Cliente creado correctamente."
    );
    onClose();
  };

  return (
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
  );
}