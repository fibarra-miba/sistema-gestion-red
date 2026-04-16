import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CancelIcon from "@mui/icons-material/Cancel";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import BuildIcon from "@mui/icons-material/Build";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { useContrato } from "../hooks/useContrato";
import { useActivateContrato } from "../hooks/useActivateContrato";
import { useSuspendContrato } from "../hooks/useSuspendContrato";
import { useResumeContrato } from "../hooks/useResumeContrato";
import { useCancelContrato } from "../hooks/useCancelContrato";
import { useTerminateContrato } from "../hooks/useTerminateContrato";

import ChangePlanDialog from "./ChangePlanDialog";
import ConfirmTechnicalConditionDialog from "./ConfirmTechnicalConditionDialog";

interface Props {
  open: boolean;
  contratoId: number | null;
  onClose: () => void;
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "ACTIVO":
      return "success";
    case "SUSPENDIDO":
      return "warning";
    case "CANCELADO":
    case "BAJA":
      return "error";
    case "PENDIENTE_INSTALACION":
      return "info";
    default:
      return "default";
  }
};

const ContratoDetailDialog = ({ open, contratoId, onClose }: Props) => {
  const { data: contrato, isLoading, isError } = useContrato(contratoId ?? undefined);

  const activateMutation = useActivateContrato();
  const suspendMutation = useSuspendContrato();
  const resumeMutation = useResumeContrato();
  const cancelMutation = useCancelContrato();
  const terminateMutation = useTerminateContrato();

  const [openChangePlan, setOpenChangePlan] = useState(false);
  const [openTechnical, setOpenTechnical] = useState(false);

  const isMutating =
    activateMutation.isPending ||
    suspendMutation.isPending ||
    resumeMutation.isPending ||
    cancelMutation.isPending ||
    terminateMutation.isPending;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Detalle del contrato
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {isError && (
            <Alert severity="error">No se pudo cargar el detalle del contrato.</Alert>
          )}

          {!isLoading && !isError && contrato && (
            <Stack spacing={2.5}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle2">Cliente</Typography>
                  <Typography>
                    {contrato.cliente_nombre} {contrato.cliente_apellido}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2">Plan</Typography>
                  <Typography>{contrato.plan_nombre}</Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2">Inicio</Typography>
                    <Typography>
                      {new Date(contrato.fecha_inicio_contrato).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="subtitle2">Fin</Typography>
                    <Typography>
                      {contrato.fecha_fin_contrato
                        ? new Date(contrato.fecha_fin_contrato).toLocaleDateString()
                        : "-"}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Typography variant="subtitle2">Estado</Typography>
                  <Chip
                    label={contrato.estado_contrato_descripcion}
                    color={getEstadoColor(contrato.estado_contrato_descripcion) as
                      | "default"
                      | "success"
                      | "warning"
                      | "error"
                      | "info"}
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2">ID contrato</Typography>
                  <Typography>{contrato.contrato_id}</Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={1.25}>
                <Typography variant="subtitle2">Acciones</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {contrato.estado_contrato_descripcion === "BORRADOR" && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<BuildIcon />}
                        onClick={() => setOpenTechnical(true)}
                        disabled={isMutating}
                      >
                        Confirmar condición técnica
                      </Button>

                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => activateMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Activar
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => cancelMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}

                  {contrato.estado_contrato_descripcion === "PENDIENTE_INSTALACION" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => activateMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Activar
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => cancelMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}

                  {contrato.estado_contrato_descripcion === "ACTIVO" && (
                    <>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<PauseIcon />}
                        onClick={() => suspendMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Suspender
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setOpenChangePlan(true)}
                        disabled={isMutating}
                      >
                        Cambiar plan
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<StopCircleIcon />}
                        onClick={() => terminateMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Dar de baja
                      </Button>
                    </>
                  )}

                  {contrato.estado_contrato_descripcion === "SUSPENDIDO" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => resumeMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Reanudar
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setOpenChangePlan(true)}
                        disabled={isMutating}
                      >
                        Cambiar plan
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<StopCircleIcon />}
                        onClick={() => terminateMutation.mutate(contrato.contrato_id)}
                        disabled={isMutating}
                      >
                        Dar de baja
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {contrato && (
        <>
          <ChangePlanDialog
            open={openChangePlan}
            contrato={contrato}
            onClose={() => setOpenChangePlan(false)}
          />

          <ConfirmTechnicalConditionDialog
            open={openTechnical}
            contrato={contrato}
            onClose={() => setOpenTechnical(false)}
          />
        </>
      )}
    </>
  );
};

export default ContratoDetailDialog;