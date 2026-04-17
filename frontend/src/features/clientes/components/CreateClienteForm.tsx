import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, Alert } from "@mui/material";
import { useCreateCliente } from "../hooks/useCreateCliente";
import { useUpdateCliente } from "../hooks/useUpdateCliente";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

type Props = {
  onSuccess?: () => void;
  cliente?: {
    cliente_id: number;
    nombre_cliente?: string;
    apellido_cliente?: string;
    email_cliente?: string;
    dni?: string;
    dni_cliente?: string;
    telefono?: string;
    telefono_cliente?: string;
  };
};

type ClienteForm = {
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
};

const EMPTY_VALUES: ClienteForm = {
  nombre: "",
  apellido: "",
  email: "",
  dni: "",
  telefono: "",
};

const CreateClienteForm = ({ onSuccess, cliente }: Props) => {
  const isEditMode = !!cliente;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ClienteForm>({
    defaultValues: EMPTY_VALUES,
  });

  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mappedClienteValues = useMemo<ClienteForm>(() => {
    if (!cliente) return EMPTY_VALUES;

    return {
      nombre: cliente.nombre_cliente ?? "",
      apellido: cliente.apellido_cliente ?? "",
      email: cliente.email_cliente ?? "",
      dni: cliente.dni ?? cliente.dni_cliente ?? "",
      telefono: cliente.telefono ?? cliente.telefono_cliente ?? "",
    };
  }, [cliente]);

  useEffect(() => {
    clearErrors();
    setErrorMsg(null);
    reset(mappedClienteValues);
  }, [mappedClienteValues, reset, clearErrors]);

  const handleServerValidationErrors = (error: any) => {
    const response = error?.response?.data;

    if (response?.detail && Array.isArray(response.detail)) {
      response.detail.forEach((err: any) => {
        const field = err.loc?.[1];
        let message = err.msg;

        if (typeof err.msg === "string" && err.msg.includes("at least")) {
          const match = err.msg.match(/\d+/);
          const min = match ? match[0] : "";
          message = `Debe tener al menos ${min} caracteres`;
        }

        if (typeof err.msg === "string" && err.msg.includes("valid email")) {
          message = "Email inválido";
        }

        if (typeof err.msg === "string" && err.msg.includes("field required")) {
          message = "Campo obligatorio";
        }

        if (field) {
          setError(field as keyof ClienteForm, {
            type: "server",
            message,
          });
        }
      });

      return true;
    }

    return false;
  };

  const onSubmit = (data: ClienteForm) => {
    setErrorMsg(null);
    clearErrors();

    if (isEditMode && cliente) {
      updateMutation.mutate(
        {
          id: cliente.cliente_id,
          ...data,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (error: any) => {
            const handled = handleServerValidationErrors(error);
            if (!handled) {
              setErrorMsg(
                getErrorMessage(error, "No se pudo actualizar el cliente.")
              );
            }
          },
        }
      );
      return;
    }

    createMutation.mutate(
      {
        ...data,
        estado_cliente_id: 1,
      },
      {
        onSuccess: () => {
          reset(EMPTY_VALUES);
          onSuccess?.();
        },
        onError: (error: any) => {
          const handled = handleServerValidationErrors(error);
          if (!handled) {
            setErrorMsg(
              getErrorMessage(error, "No se pudo crear el cliente.")
            );
          }
        },
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <TextField
        label="Nombre"
        {...register("nombre", {
          required: "El nombre es obligatorio",
        })}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
        fullWidth
        disabled={isPending}
      />

      <TextField
        label="Apellido"
        {...register("apellido", {
          required: "El apellido es obligatorio",
        })}
        error={!!errors.apellido}
        helperText={errors.apellido?.message}
        fullWidth
        disabled={isPending}
      />

      <TextField
        label="Email"
        {...register("email", {
          required: "El email es obligatorio",
          pattern: {
            value: /^\S+@\S+\.\S+$/i,
            message: "Email inválido",
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
        fullWidth
        disabled={isPending}
      />

      <TextField
        label="DNI"
        {...register("dni", {
          required: "El DNI es obligatorio",
        })}
        error={!!errors.dni}
        helperText={errors.dni?.message}
        fullWidth
        disabled={isPending}
      />

      <TextField
        label="Teléfono"
        {...register("telefono", {
          required: "El teléfono es obligatorio",
        })}
        error={!!errors.telefono}
        helperText={errors.telefono?.message}
        fullWidth
        disabled={isPending}
      />

      <Button type="submit" variant="contained" disabled={isPending}>
        {isPending
          ? isEditMode
            ? "Guardando..."
            : "Creando..."
          : isEditMode
          ? "Guardar cambios"
          : "Crear cliente"}
      </Button>
    </Box>
  );
};

export default CreateClienteForm;