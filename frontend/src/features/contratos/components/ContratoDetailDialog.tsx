import { useMemo, useState } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { useNotifications } from "../../../components/ui/notifications/useNotifications";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

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

type ConfirmActionType = "cancel" | "suspend" | "terminate" | null;

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

const DetailSkeleton = () => {
  return (
    <Stack spacing={2.5}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle2">Cliente</Typography>
          <Skeleton variant="text" width="70%" height={32} />
        </Box>

        <Box>
          <Typography variant="subtitle2">Plan</Typography>
          <Skeleton variant="text" width="55%" height={32} />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box flex={1}>
            <Typography variant="subtitle2">Inicio</Typography>
            <Skeleton variant="text" width="80%" height={32} />
          </Box>

          <Box flex={1}>
            <Typography variant="subtitle2">Fin</Typography>
            <Skeleton variant="text" width="80%" height={32} />
          </Box>
        </Stack>

        <Box>
          <Typography variant="subtitle2">Estado</Typography>
          <Skeleton variant="rounded" width={140} height={28} />
        </Box>

        <Box>
          <Typography variant="subtitle2">ID contrato</Typography>
          <Skeleton variant="text" width={90} height={32} />
        </Box>
      </Stack>

      <Divider />

      <Stack spacing={1.25}>
        <Typography variant="subtitle2">Acciones</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Skeleton variant="rounded" width={220} height={36} />
          <Skeleton variant="rounded" width={130} height={36} />
          <Skeleton variant="rounded" width={150} height={36} />
        </Stack>
      </Stack>
    </Stack>
  );
};

const ContratoDetailDialog = ({ open, contratoId, onClose }: Props) => {
  const { success, error: notifyError } = useNotifications();

  const {
    data: contrato,
    isLoading,
    isError,
  } = useContrato(contratoId ?? undefined);

  const activateMutation = useActivateContrato();
  const suspendMutation = useSuspendContrato();
  const resumeMutation = useResumeContrato();
  const cancelMutation = useCancelContrato();
  const terminateMutation = useTerminateContrato();

  const [openChangePlan, setOpenChangePlan] = useState(false);
  const [openTechnical, setOpenTechnical] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType>(null);

  const confirmConfig = useMemo(() => {
    switch (confirmAction) {
      case "cancel":
        return {
          title: "Confirmar cancelación",
          description:
            "Esta acción cancelará el contrato actual. Verificá que realmente quieras continuar.",
          confirmText: "Sí, cancelar",
          color: "error" as const,
          loading: cancelMutation.isPending,
        };
      case "suspend":
        return {
          title: "Confirmar suspensión",
          description:
            "El contrato quedará suspendido hasta que se reanude manualmente.",
          confirmText: "Sí, suspender",
          color: "warning" as const,
          loading: suspendMutation.isPending,
        };
      case "terminate":
        return {
          title: "Confirmar baja",
          description:
            "El contrato será dado de baja. Esta acción impacta directamente en el ciclo de vida del servicio.",
          confirmText: "Sí, dar de baja",
          color: "error" as const,
          loading: terminateMutation.isPending,
        };
      default:
        return null;
    }
  }, [
    confirmAction,
    cancelMutation.isPending,
    suspendMutation.isPending,
    terminateMutation.isPending,
  ]);

  const isActivateLoading = activateMutation.isPending;
  const isResumeLoading = resumeMutation.isPending;
  const isSuspendLoading = suspendMutation.isPending;
  const isCancelLoading = cancelMutation.isPending;
  const isTerminateLoading = terminateMutation.isPending;

  const isAnyActionPending =
    isActivateLoading ||
    isResumeLoading ||
    isSuspendLoading ||
    isCancelLoading ||
    isTerminateLoading;

  const handleActivate = async () => {
    if (!contrato) return;

    try {
      await activateMutation.mutateAsync(contrato.contrato_id);
      success("Contrato activado correctamente.");
    } catch (err: any) {
      notifyError(getErrorMessage(err, "No se pudo activar el contrato."));
    }
  };

  const handleResume = async () => {
    if (!contrato) return;

    try {
      await resumeMutation.mutateAsync(contrato.contrato_id);
      success("Contrato reanudado correctamente.");
    } catch (err: any) {
      notifyError(getErrorMessage(err, "No se pudo reanudar el contrato."));
    }
  };

  const handleConfirmCriticalAction = async () => {
    if (!contrato || !confirmAction) return;

    try {
      if (confirmAction === "cancel") {
        await cancelMutation.mutateAsync(contrato.contrato_id);
        success("Contrato cancelado correctamente.");
      }

      if (confirmAction === "suspend") {
        await suspendMutation.mutateAsync(contrato.contrato_id);
        success("Contrato suspendido correctamente.");
      }

      if (confirmAction === "terminate") {
        await terminateMutation.mutateAsync(contrato.contrato_id);
        success("Contrato dado de baja correctamente.");
      }

      setConfirmAction(null);
    } catch (err: any) {
      setConfirmAction(null);
      notifyError(
        getErrorMessage(err, "No se pudo completar la acción solicitada.")
      );
    }
  };

  const handleOpenNewContrato = (newContratoId: number) => {
    setOpenChangePlan(false);
    success("Plan cambiado correctamente. Se abrió el nuevo contrato.");

    window.setTimeout(() => {
      onClose();

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("open-contrato-detail", {
            detail: { contratoId: newContratoId },
          })
        );
      }, 50);
    }, 50);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (isAnyActionPending && reason !== "escapeKeyDown") {
            return;
          }
          onClose();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Detalle del contrato

          <Tooltip title="Cerrar">
            <span>
              <IconButton
                aria-label="close"
                onClick={onClose}
                disabled={isAnyActionPending}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </span>
          </Tooltip>
        </DialogTitle>

        <DialogContent dividers>
          {isLoading && <DetailSkeleton />}

          {isError && (
            <Alert severity="error">
              No se pudo cargar el detalle del contrato.
            </Alert>
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
                      {new Date(
                        contrato.fecha_inicio_contrato
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="subtitle2">Fin</Typography>
                    <Typography>
                      {contrato.fecha_fin_contrato
                        ? new Date(
                            contrato.fecha_fin_contrato
                          ).toLocaleDateString()
                        : "-"}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Typography variant="subtitle2">Estado</Typography>
                  <Chip
                    label={contrato.estado_contrato_descripcion}
                    color={
                      getEstadoColor(contrato.estado_contrato_descripcion) as
                        | "default"
                        | "success"
                        | "warning"
                        | "error"
                        | "info"
                    }
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
                      <Tooltip title="Confirmar si el domicilio es apto o si requiere instalación">
                        <span>
                          <Button
                            variant="contained"
                            startIcon={<BuildIcon />}
                            onClick={() => setOpenTechnical(true)}
                            disabled={isAnyActionPending}
                          >
                            Confirmar condición técnica
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip title="Activar contrato">
                        <span>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleActivate}
                            disabled={isActivateLoading}
                          >
                            {isActivateLoading ? "Activando..." : "Activar"}
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip title="Cancelar contrato">
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => setConfirmAction("cancel")}
                            disabled={isCancelLoading}
                          >
                            {isCancelLoading ? "Cancelando..." : "Cancelar"}
                          </Button>
                        </span>
                      </Tooltip>
                    </>
                  )}

                  {contrato.estado_contrato_descripcion ===
                    "PENDIENTE_INSTALACION" && (
                    <>
                      <Tooltip title="Activar contrato">
                        <span>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleActivate}
                            disabled={isActivateLoading}
                          >
                            {isActivateLoading ? "Activando..." : "Activar"}
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip title="Cancelar contrato">
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => setConfirmAction("cancel")}
                            disabled={isCancelLoading}
                          >
                            {isCancelLoading ? "Cancelando..." : "Cancelar"}
                          </Button>
                        </span>
                      </Tooltip>
                    </>
                  )}

                  {contrato.estado_contrato_descripcion === "ACTIVO" && (
                    <>
                      <Tooltip title="Suspender contrato">
                        <span>
                          <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<PauseIcon />}
                            onClick={() => setConfirmAction("suspend")}
                            disabled={isSuspendLoading}
                          >
                            {isSuspendLoading ? "Suspendiendo..." : "Suspender"}
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip title="Crear un nuevo contrato con otro plan">
                        <span>
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setOpenChangePlan(true)}
                            disabled={isAnyActionPending}
                          >
                            Cambiar plan
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip title="Dar de baja contrato">
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<StopCircleIcon />}
                            onClick={() => setConfirmAction("terminate")}
                            disabled={isTerminateLoading}
                          >
                            {isTerminateLoading ? "Procesando baja..." : "Dar de baja"}
                          </Button>
                        </span>
                      </Tooltip>
                    </>
                  )}

                  {contrato.estado_contrato_descripcion === "SUSPENDIDO" && (
                    <>
                      <Tooltip title="Reanudar contrato">
                        <span>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleResume}
                            disabled={isResumeLoading}
                          >
                            {isResumeLoading ? "Reanudando..." : "Reanudar"}
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip title="Crear un nuevo contrato con otro plan">
                        <span>
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setOpenChangePlan(true)}
                            disabled={isAnyActionPending}
                          >
                            Cambiar plan
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip title="Dar de baja contrato">
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<StopCircleIcon />}
                            onClick={() => setConfirmAction("terminate")}
                            disabled={isTerminateLoading}
                          >
                            {isTerminateLoading ? "Procesando baja..." : "Dar de baja"}
                          </Button>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isAnyActionPending}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!confirmAction}
        onClose={() => {
          if (!confirmConfig?.loading) {
            setConfirmAction(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{confirmConfig?.title}</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmConfig?.description}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConfirmAction(null)}
            disabled={!!confirmConfig?.loading}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            color={confirmConfig?.color}
            onClick={handleConfirmCriticalAction}
            disabled={!!confirmConfig?.loading}
          >
            {confirmConfig?.loading ? "Procesando..." : confirmConfig?.confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      {contrato && (
        <>
          <ChangePlanDialog
            open={openChangePlan}
            contrato={contrato}
            onClose={() => setOpenChangePlan(false)}
            onChanged={handleOpenNewContrato}
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