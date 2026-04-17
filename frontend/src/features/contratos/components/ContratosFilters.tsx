// frontend/src/features/contratos/components/ContratosFilters.tsx
import { useEffect, useMemo, useState } from "react";
import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { usePlanes } from "../../planes/hooks/usePlanes";

type ContratosFiltersValue = {
  search?: string;
  estado_contrato_id?: number;
  plan_id?: number;
};

interface Props {
  value: ContratosFiltersValue;
  onFilter: (filters: ContratosFiltersValue) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const ESTADOS_CONTRATO = [
  { id: 1, label: "BORRADOR" },
  { id: 2, label: "PENDIENTE_INSTALACION" },
  { id: 3, label: "ACTIVO" },
  { id: 4, label: "SUSPENDIDO" },
  { id: 5, label: "BAJA" },
  { id: 6, label: "CANCELADO" },
];

const ContratosFilters = ({ value, onFilter, onDirtyChange }: Props) => {
  const [search, setSearch] = useState(value.search ?? "");
  const [estadoContratoId, setEstadoContratoId] = useState<number | "">(
    value.estado_contrato_id ?? ""
  );
  const [planId, setPlanId] = useState<number | "">(value.plan_id ?? "");

  const { data: planes = [] } = usePlanes();

  useEffect(() => {
    setSearch(value.search ?? "");
    setEstadoContratoId(value.estado_contrato_id ?? "");
    setPlanId(value.plan_id ?? "");
  }, [value]);

  const normalizedFilters = useMemo(
    () => ({
      search: search.trim(),
      estado_contrato_id:
        estadoContratoId === "" ? undefined : Number(estadoContratoId),
      plan_id: planId === "" ? undefined : Number(planId),
    }),
    [search, estadoContratoId, planId]
  );

  const dirty = useMemo(
    () =>
      !!normalizedFilters.search ||
      normalizedFilters.estado_contrato_id !== undefined ||
      normalizedFilters.plan_id !== undefined,
    [normalizedFilters]
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onFilter(normalizedFilters);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [normalizedFilters, onFilter]);

  const handleClear = () => {
    setSearch("");
    setEstadoContratoId("");
    setPlanId("");
  };

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <TextField
          label="Cliente"
          placeholder="Buscar por nombre o apellido"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Estado"
          value={estadoContratoId}
          onChange={(e) =>
            setEstadoContratoId(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
          fullWidth
        >
          <MenuItem value="">Todos</MenuItem>
          {ESTADOS_CONTRATO.map((estado) => (
            <MenuItem key={estado.id} value={estado.id}>
              {estado.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Plan"
          value={planId}
          onChange={(e) =>
            setPlanId(e.target.value === "" ? "" : Number(e.target.value))
          }
          fullWidth
        >
          <MenuItem value="">Todos</MenuItem>
          {planes.map((plan) => (
            <MenuItem key={plan.plan_id} value={plan.plan_id}>
              {plan.nombre_plan}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Stack direction="row" justifyContent="flex-end">
        <Button variant="text" onClick={handleClear}>
          Limpiar
        </Button>
      </Stack>
    </Stack>
  );
};

export default ContratosFilters;