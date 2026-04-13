import {
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { useDomicilios } from "../hooks/useDomicilios";
import type { Domicilio } from "../types/domicilio";

type Props = {
  open: boolean;
  onClose: () => void;
  clienteId: number;
};

export default function DomiciliosHistoryDialog({
  open,
  onClose,
  clienteId,
}: Props) {
  const { data, isLoading, isError } = useDomicilios(clienteId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Historial de domicilios

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            Error al cargar el historial de domicilios
          </Alert>
        ) : !data || data.length === 0 ? (
          <Typography color="text.secondary">
            El cliente no posee domicilios registrados.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {data.map((domicilio: Domicilio, index: number) => {
              const esVigente = domicilio.fecha_hasta_dom == null;

              return (
                <Box key={domicilio.domicilio_id}>
                  <Stack spacing={1.2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        {esVigente ? (
                          <HomeOutlinedIcon fontSize="small" />
                        ) : (
                          <HistoryOutlinedIcon fontSize="small" />
                        )}

                        <Typography sx={{ fontWeight: 600 }}>
                          {domicilio.calle ?? "-"}
                          {domicilio.numero ? ` ${domicilio.numero}` : ""}
                        </Typography>
                      </Stack>

                      <Chip
                        label={esVigente ? "Vigente" : "Histórico"}
                        color={esVigente ? "success" : "default"}
                        size="small"
                      />
                    </Stack>

                    <Typography variant="body2">
                      <b>Complejo:</b> {domicilio.complejo ?? "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>Piso:</b> {domicilio.piso ?? "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>Depto:</b> {domicilio.depto ?? "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>Referencias:</b> {domicilio.referencias ?? "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>Desde:</b>{" "}
                      {domicilio.fecha_desde_dom
                        ? new Date(domicilio.fecha_desde_dom).toLocaleString()
                        : "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>Hasta:</b>{" "}
                      {domicilio.fecha_hasta_dom
                        ? new Date(domicilio.fecha_hasta_dom).toLocaleString()
                        : "-"}
                    </Typography>
                  </Stack>

                  {index < data.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}