import { useEffect, useState } from "react";
import { Box, MenuItem, Stack, TextField } from "@mui/material";

import { useClientes } from "../../clientes/hooks/useClientes";
import { usePlanes } from "../../planes/hooks/usePlanes";

interface Props {
  value?: {
    cliente_id?: number;
    estado_contrato_id?: number;
    plan_id?: number;
  };
  onFilter: (filters: {
    cliente_id?: number;
    estado_contrato_id?: number;
    plan_id?: number;
  }) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const estadosContrato = [
  { id: 1, label: "BORRADOR" },
  { id: 2, label: "PENDIENTE_INSTALACION" },
  { id: 3, label: "ACTIVO" },
  { id: 4, label: "SUSPENDIDO" },
  { id: 5, label: "BAJA" },
  { id: 6, label: "CANCELADO" },
];

const ContratosFilters = ({ value, onFilter, onDirtyChange }: Props) => {
  const { data: clientes = [] } = useClientes("");
  const { data: planes = [] } = usePlanes();

  const [clienteId, setClienteId] = useState<number | "">(value?.cliente_id ?? "");
  const [estadoId, setEstadoId] = useState<number | "">(value?.estado_contrato_id ?? "");
  const [planId, setPlanId] = useState<number | "">(value?.plan_id ?? "");

  useEffect(() => {
    setClienteId(value?.cliente_id ?? "");
    setEstadoId(value?.estado_contrato_id ?? "");
    setPlanId(value?.plan_id ?? "");
  }, [value?.cliente_id, value?.estado_contrato_id, value?.plan_id]);

  const emitFilters = (
    nextClienteId: number | "",
    nextEstadoId: number | "",
    nextPlanId: number | ""
  ) => {
    const filters = {
      cliente_id: nextClienteId === "" ? undefined : nextClienteId,
      estado_contrato_id: nextEstadoId === "" ? undefined : nextEstadoId,
      plan_id: nextPlanId === "" ? undefined : nextPlanId,
    };

    onFilter(filters);

    const dirty =
      filters.cliente_id !== undefined ||
      filters.estado_contrato_id !== undefined ||
      filters.plan_id !== undefined;

    onDirtyChange?.(dirty);
  };

  const handleClienteChange = (value: string) => {
    const nextValue = value === "" ? "" : Number(value);
    setClienteId(nextValue);
    emitFilters(nextValue, estadoId, planId);
  };

  const handleEstadoChange = (value: string) => {
    const nextValue = value === "" ? "" : Number(value);
    setEstadoId(nextValue);
    emitFilters(clienteId, nextValue, planId);
  };

  const handlePlanChange = (value: string) => {
    const nextValue = value === "" ? "" : Number(value);
    setPlanId(nextValue);
    emitFilters(clienteId, estadoId, nextValue);
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          select
          fullWidth
          label="Cliente"
          value={clienteId}
          onChange={(e) => handleClienteChange(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {clientes.map((cliente: any) => (
            <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
              {cliente.nombre_cliente} {cliente.apellido_cliente}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Estado"
          value={estadoId}
          onChange={(e) => handleEstadoChange(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {estadosContrato.map((estado) => (
            <MenuItem key={estado.id} value={estado.id}>
              {estado.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Plan"
          value={planId}
          onChange={(e) => handlePlanChange(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {planes.map((plan) => (
            <MenuItem key={plan.plan_id} value={plan.plan_id}>
              {plan.nombre_plan}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};

export default ContratosFilters;