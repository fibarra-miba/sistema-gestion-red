import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { useCreateCliente } from "../hooks/useCreateCliente";
import { useState } from "react";

type Props = {
  onSuccess?: () => void;
};

type ClienteForm = {
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
};

const CreateClienteForm = ({ onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClienteForm>();

  const { mutate, isPending } = useCreateCliente();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = (data: ClienteForm) => {
    setErrorMsg(null);

    const payload = {
      ...data,
      estado_cliente_id: 1,
    };

    mutate(payload, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        const response = error?.response?.data;

        if (response?.detail && Array.isArray(response.detail)) {
          response.detail.forEach((err: any) => {
            const field = err.loc?.[1];
            let message = err.msg;

            // 🔥 traducción básica
            if (err.msg.includes("at least")) {
              const match = err.msg.match(/\d+/);
              const min = match ? match[0] : "";
              message = `Debe tener al menos ${min} caracteres`;
            }

            if (err.msg.includes("valid email")) {
              message = "Email inválido";
            }

            if (err.msg.includes("field required")) {
              message = "Campo obligatorio";
            }

            if (field) {
              setError(field as keyof ClienteForm, {
                type: "server",
                message,
              });
            }
          });
        } else {
          setErrorMsg("Error inesperado al crear cliente");
        }
      },
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <TextField
        label="Nombre"
        {...register("nombre", { required: "El nombre es obligatorio" })}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
      />

      <TextField
        label="Apellido"
        {...register("apellido", { required: "El apellido es obligatorio" })}
        error={!!errors.apellido}
        helperText={errors.apellido?.message}
      />

      <TextField
        label="Email"
        {...register("email", {
          required: "El email es obligatorio",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Email inválido",
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        label="DNI"
        {...register("dni", { required: "El DNI es obligatorio" })}
        error={!!errors.dni}
        helperText={errors.dni?.message}
      />

      <TextField
        label="Teléfono"
        {...register("telefono", { required: "El teléfono es obligatorio" })}
        error={!!errors.telefono}
        helperText={errors.telefono?.message}
      />

      <Button type="submit" variant="contained" disabled={isPending}>
        {isPending ? "Creando..." : "Crear"}
      </Button>
    </Box>
  );
};

export default CreateClienteForm;