import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

import { usePlanes } from "../../planes/hooks/usePlanes";
import { useChangePlanContrato } from "../hooks/useChangePlanContrato";
import type { Contrato } from "../types/contrato";

interface Props {
  open: boolean;
  contrato: Contrato | null;
  onClose: () => void;
}

const ChangePlanDialog = ({ open, contrato, onClose }: Props) => {
  const { data: planes = [] } = usePlanes();
  const changePlanMutation = useChangePlanContrato();
  const [newPlanId, setNewPlanId] = useState<number>(0);

  useEffect(() => {
    if (contrato) {
      setNewPlanId(contrato.plan_id);
    }
  }, [contrato]);

  if (!contrato) return null;

  const handleSubmit = async () => {
    await changePlanMutation.mutateAsync({
      contratoId: contrato.contrato_id,
      payload: {
        new_plan_id: newPlanId,
      },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cambiar plan</DialogTitle>

      <DialogContent dividers>
        <TextField
          select
          fullWidth
          label="Nuevo plan"
          value={newPlanId}
          onChange={(e) => setNewPlanId(Number(e.target.value))}
          sx={{ mt: 1 }}
        >
          {planes.map((plan) => (
            <MenuItem key={plan.plan_id} value={plan.plan_id}>
              {plan.nombre_plan}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            changePlanMutation.isPending ||
            !newPlanId ||
            newPlanId === contrato.plan_id
          }
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePlanDialog;