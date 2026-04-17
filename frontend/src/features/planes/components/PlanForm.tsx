import { useEffect } from "react";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import type { Plan, PlanCreateInput } from "../types/plan";

interface PlanFormProps {
  defaultValues?: Partial<Plan>;
  onSubmit: (values: PlanCreateInput) => void | Promise<void>;
  isSubmitting?: boolean;
}

type FormValues = {
  nombre_plan: string;
  velocidad_mbps_plan: number;
  descripcion_plan: string;
  estado_plan_id: number;
};

const EMPTY_VALUES: FormValues = {
  nombre_plan: "",
  velocidad_mbps_plan: 0,
  descripcion_plan: "",
  estado_plan_id: 1,
};

export function PlanForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: PlanFormProps) {
  const isEditMode = !!defaultValues?.plan_id;

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      nombre_plan: defaultValues?.nombre_plan ?? EMPTY_VALUES.nombre_plan,
      velocidad_mbps_plan:
        defaultValues?.velocidad_mbps_plan ?? EMPTY_VALUES.velocidad_mbps_plan,
      descripcion_plan:
        defaultValues?.descripcion_plan ?? EMPTY_VALUES.descripcion_plan,
      estado_plan_id:
        defaultValues?.estado_plan_id ?? EMPTY_VALUES.estado_plan_id,
    },
  });

  useEffect(() => {
    reset({
      nombre_plan: defaultValues?.nombre_plan ?? EMPTY_VALUES.nombre_plan,
      velocidad_mbps_plan:
        defaultValues?.velocidad_mbps_plan ?? EMPTY_VALUES.velocidad_mbps_plan,
      descripcion_plan:
        defaultValues?.descripcion_plan ?? EMPTY_VALUES.descripcion_plan,
      estado_plan_id:
        defaultValues?.estado_plan_id ?? EMPTY_VALUES.estado_plan_id,
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))}>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Controller
          name="nombre_plan"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Nombre del plan"
              fullWidth
              disabled={isSubmitting}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="velocidad_mbps_plan"
          control={control}
          rules={{
            required: "La velocidad es obligatoria",
            min: { value: 1, message: "Debe ser mayor a 0" },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="number"
              label="Velocidad (Mbps)"
              fullWidth
              disabled={isSubmitting}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />

        <Controller
          name="descripcion_plan"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="estado_plan_id"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Estado"
              fullWidth
              disabled={isSubmitting}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              <MenuItem value={1}>ACTIVO</MenuItem>
              <MenuItem value={2}>INACTIVO</MenuItem>
            </TextField>
          )}
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting
            ? isEditMode
              ? "Guardando..."
              : "Creando..."
            : isEditMode
            ? "Guardar cambios"
            : "Crear plan"}
        </Button>
      </Stack>
    </form>
  );
}