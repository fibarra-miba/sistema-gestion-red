import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";

import { useConfirmTechnicalCondition } from "../hooks/useConfirmTechnicalCondition";
import type { Contrato } from "../types/contrato";

interface Props {
  open: boolean;
  contrato: Contrato | null;
  onClose: () => void;
}

const ConfirmTechnicalConditionDialog = ({
  open,
  contrato,
  onClose,
}: Props) => {
  const confirmMutation = useConfirmTechnicalCondition();

  const [apto, setApto] = useState(true);
  const [fechaProgramacion, setFechaProgramacion] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (open) {
      setApto(true);
      setFechaProgramacion("");
      setTecnico("");
      setNotas("");
    }
  }, [open]);

  if (!contrato) return null;

  const handleSubmit = async () => {
    await confirmMutation.mutateAsync({
      contratoId: contrato.contrato_id,
      payload: {
        apto,
        fecha_programacion_pinstalacion: apto
          ? undefined
          : new Date(fechaProgramacion).toISOString(),
        tecnico_pinstalacion: tecnico || undefined,
        notas_pinstalacion: notas || undefined,
      },
    });

    onClose();
  };

  const disabled =
    confirmMutation.isPending || (!apto && fechaProgramacion.trim() === "");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Confirmar condición técnica</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={apto}
                onChange={(e) => setApto(e.target.checked)}
              />
            }
            label="Apto para activar sin instalación"
          />

          {!apto && (
            <>
              <TextField
                fullWidth
                label="Fecha de programación"
                type="datetime-local"
                value={fechaProgramacion}
                onChange={(e) => setFechaProgramacion(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Técnico"
                value={tecnico}
                onChange={(e) => setTecnico(e.target.value)}
              />

              <TextField
                fullWidth
                label="Notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                multiline
                rows={3}
              />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmTechnicalConditionDialog;