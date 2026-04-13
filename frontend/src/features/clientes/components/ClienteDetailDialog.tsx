import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { useDomicilioVigente } from "../../domicilios/hooks/useDomicilioVigente";
import CreateDomicilioDialog from "../../domicilios/components/CreateDomicilioDialog";
import DomiciliosHistoryDialog from "../../domicilios/components/DomiciliosHistoryDialog";

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
  const [openCreateDomicilio, setOpenCreateDomicilio] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const clienteId = cliente?.cliente_id;

  const {
    data: domicilio,
    isLoading: isLoadingDomicilio,
    isError: isErrorDomicilio,
    error: domicilioError,
  } = useDomicilioVigente(clienteId);

  if (!cliente) return null;

  const domicilioNoEncontrado =
    isErrorDomicilio && (domicilioError as any)?.response?.status === 404;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h6" component="span">
            Detalle del cliente
          </Typography>

          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={onEdit}
          >
            Editar cliente
          </Button>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <Typography>
                <b>ID:</b> {cliente.cliente_id}
              </Typography>
              <Typography>
                <b>Nombre:</b> {cliente.nombre_cliente ?? "-"}
              </Typography>
              <Typography>
                <b>Apellido:</b> {cliente.apellido_cliente ?? "-"}
              </Typography>
              <Typography>
                <b>Email:</b> {cliente.email_cliente ?? "-"}
              </Typography>
              <Typography>
                <b>DNI:</b> {cliente.dni ?? cliente.dni_cliente ?? "-"}
              </Typography>
              <Typography>
                <b>Teléfono:</b>{" "}
                {cliente.telefono ?? cliente.telefono_cliente ?? "-"}
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <HomeOutlinedIcon fontSize="small" />
                  <Typography variant="h6">Domicilio vigente</Typography>

                  {!domicilioNoEncontrado && !isLoadingDomicilio && (
                    <Chip label="Vigente" color="success" size="small" />
                  )}
                </Stack>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1,
                    flex: 1,
                    minWidth: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Tooltip title="Historial de domicilios" arrow>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setOpenHistory(true)}
                      sx={{
                        minWidth: "auto",
                        px: 1.2,
                        width: 36,
                      }}
                    >
                      <HistoryOutlinedIcon fontSize="small" />
                    </Button>
                  </Tooltip>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddLocationAltOutlinedIcon />}
                    onClick={() => setOpenCreateDomicilio(true)}
                  >
                    Nuevo domicilio
                  </Button>
                </Box>
              </Box>

              {isLoadingDomicilio ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : domicilioNoEncontrado ? (
                <Typography color="text.secondary">
                  El cliente no posee un domicilio vigente.
                </Typography>
              ) : isErrorDomicilio ? (
                <Alert severity="error">
                  Error al cargar el domicilio vigente
                </Alert>
              ) : domicilio ? (
                <Stack spacing={1}>
                  <Typography>
                    <b>Calle:</b> {domicilio.calle ?? "-"}
                    {domicilio.numero ? ` ${domicilio.numero}` : ""}
                  </Typography>
                  <Typography>
                    <b>Complejo:</b> {domicilio.complejo ?? "-"}
                  </Typography>
                  <Typography>
                    <b>Piso:</b> {domicilio.piso ?? "-"}
                  </Typography>
                  <Typography>
                    <b>Depto:</b> {domicilio.depto ?? "-"}
                  </Typography>
                  <Typography>
                    <b>Referencias:</b> {domicilio.referencias ?? "-"}
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  El cliente no posee un domicilio vigente.
                </Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <CreateDomicilioDialog
        open={openCreateDomicilio}
        onClose={() => setOpenCreateDomicilio(false)}
        clienteId={cliente.cliente_id}
      />

      <DomiciliosHistoryDialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        clienteId={cliente.cliente_id}
      />
    </>
  );
}