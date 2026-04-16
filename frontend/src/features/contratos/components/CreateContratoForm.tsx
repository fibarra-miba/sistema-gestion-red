import { useEffect } from "react";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

import { useClientes } from "../../clientes/hooks/useClientes";
import { usePlanes } from "../../planes/hooks/usePlanes";
import { useDomiciliosByCliente } from "../hooks/useDomiciliosByCliente";

import type { ContratoCreateInput } from "../types/contrato";

interface Props {
  onSubmit: (values: ContratoCreateInput) => void | Promise<void>;
  isSubmitting?: boolean;
}

type FormValues = {
  cliente_id: number;
  domicilio_id: number;
  plan_id: number;
};

const CreateContratoForm = ({ onSubmit, isSubmitting = false }: Props) => {
  const { data: clientes = [] } = useClientes("");
  const { data: planes = [] } = usePlanes();

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      cliente_id: 0,
      domicilio_id: 0,
      plan_id: 0,
    },
  });

  const selectedClienteId = watch("cliente_id");
  const { data: domicilios = [] } = useDomiciliosByCliente(
    selectedClienteId || undefined
  );

  useEffect(() => {
    setValue("domicilio_id", 0);

    if (domicilios.length === 1) {
      setValue("domicilio_id", domicilios[0].domicilio_id);
    }
  }, [domicilios, setValue]);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))}>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Controller
          name="cliente_id"
          control={control}
          rules={{
            validate: (value) => value > 0 || "Debes seleccionar un cliente",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Cliente"
              value={field.value || ""}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {clientes.map((cliente: any) => (
                <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
                  {cliente.nombre_cliente} {cliente.apellido_cliente}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="domicilio_id"
          control={control}
          rules={{
            validate: (value) => value > 0 || "Debes seleccionar un domicilio",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Domicilio"
              value={field.value || ""}
              disabled={!selectedClienteId || domicilios.length === 0}
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ||
                (!selectedClienteId
                  ? "Selecciona primero un cliente"
                  : domicilios.length === 0
                  ? "El cliente no posee domicilios disponibles"
                  : undefined)
              }
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {domicilios.map((domicilio) => (
                <MenuItem
                  key={domicilio.domicilio_id}
                  value={domicilio.domicilio_id}
                >
                  {[domicilio.calle, domicilio.numero]
                    .filter(Boolean)
                    .join(" ")}
                  {domicilio.complejo ? ` - ${domicilio.complejo}` : ""}
                  {domicilio.depto ? ` ${domicilio.depto}` : ""}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="plan_id"
          control={control}
          rules={{
            validate: (value) => value > 0 || "Debes seleccionar un plan",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Plan"
              value={field.value || ""}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {planes
                .filter((plan) => plan.estado_plan_id === 1)
                .map((plan) => (
                  <MenuItem key={plan.plan_id} value={plan.plan_id}>
                    {plan.nombre_plan}
                  </MenuItem>
                ))}
            </TextField>
          )}
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Crear contrato
        </Button>
      </Stack>
    </form>
  );
};

export default CreateContratoForm;