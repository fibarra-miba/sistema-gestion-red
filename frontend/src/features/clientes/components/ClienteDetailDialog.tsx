import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

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
  cliente?: Cliente | null;
  onClose: () => void;
  onEdit: () => void;
};

export default function ClienteDetailDialog({
  open,
  cliente,
  onClose,
  onEdit,
}: Props) {
  if (!cliente) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalle del cliente</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography><b>ID:</b> {cliente.cliente_id}</Typography>
          <Typography><b>Nombre:</b> {cliente.nombre_cliente ?? "-"}</Typography>
          <Typography><b>Apellido:</b> {cliente.apellido_cliente ?? "-"}</Typography>
          <Typography><b>Email:</b> {cliente.email_cliente ?? "-"}</Typography>
          <Typography><b>DNI:</b> {cliente.dni ?? cliente.dni_cliente ?? "-"}</Typography>
          <Typography><b>Teléfono:</b> {cliente.telefono ?? cliente.telefono_cliente ?? "-"}</Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <IconButton color="primary" onClick={onEdit}>
          <EditOutlinedIcon />
        </IconButton>

        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}