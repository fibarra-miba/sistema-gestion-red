import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useNotifications } from "../../../components/ui/notifications/useNotifications";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

import { usePlanes } from "../../planes/hooks/usePlanes";
import { useChangePlanContrato } from "../hooks/useChangePlanContrato";
import type { Contrato } from "../types/contrato";

interface Props {
  open: boolean;
  contrato: Contrato;
  onClose: () => void;
  onChanged?: (newContratoId: number) => void;
}

const ChangePlanDialog = ({ open, contrato, onClose, onChanged }: Props) => {
  const { error: notifyError } = useNotifications();

  const { data: planes = [] } = usePlanes();
  const changePlanMutation = useChangePlanContrato();

  const [newPlanId, setNewPlanId] = useState<number | "">("");

  useEffect(() => {
    if (!open) {
      setNewPlanId("");
    }
  }, [open]);

  const availablePlanes = useMemo(
    () =>
      planes.filter(
        (plan) => plan.estado_plan_id === 1 && plan.plan_id !== contrato.plan_id
      ),
    [planes, contrato.plan_id]
  );

  const hasAvailablePlanes = availablePlanes.length > 0;
  const isSubmitting = changePlanMutation.isPending;

  const handleSubmit = async () => {
    if (newPlanId === "") return;

    try {
      const newContrato = await changePlanMutation.mutateAsync({
        contratoId: contrato.contrato_id,
        payload: { new_plan_id: Number(newPlanId) },
      });

      onClose();
      onChanged?.(newContrato.contrato_id);
    } catch (err: any) {
      notifyError(
        getErrorMessage(err, "No se pudo realizar el cambio de plan.")
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (isSubmitting && reason !== "escapeKeyDown") {
          return;
        }
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Cambiar plan</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            El contrato actual se cerrará y se creará un nuevo contrato con el plan seleccionado.
          </Typography>

          <TextField
            label="Plan actual"
            value={contrato.plan_nombre}
            fullWidth
            disabled
          />

          {!hasAvailablePlanes && (
            <Alert severity="info">
              No hay otros planes activos disponibles para realizar el cambio.
            </Alert>
          )}

          <TextField
            select
            label="Nuevo plan"
            value={newPlanId}
            onChange={(e) =>
              setNewPlanId(e.target.value === "" ? "" : Number(e.target.value))
            }
            fullWidth
            disabled={!hasAvailablePlanes || isSubmitting}
            helperText={
              hasAvailablePlanes
                ? "Seleccioná el nuevo plan para generar el nuevo contrato."
                : "No existen planes alternativos activos en este momento."
            }
          >
            <MenuItem value="">Seleccionar</MenuItem>
            {availablePlanes.map((plan) => (
              <MenuItem key={plan.plan_id} value={plan.plan_id}>
                {plan.nombre_plan}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={newPlanId === "" || !hasAvailablePlanes || isSubmitting}
        >
          {isSubmitting ? "Cambiando..." : "Confirmar cambio"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePlanDialog;