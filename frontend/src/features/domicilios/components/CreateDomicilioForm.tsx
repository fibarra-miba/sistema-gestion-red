import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Box, Button, TextField } from "@mui/material";
import { useCreateDomicilio } from "../hooks/useCreateDomicilio";

type Props = {
  clienteId: number;
  onSuccess?: () => void;
};

type DomicilioForm = {
  calle: string;
  numero: string;
  complejo: string;
  piso: string;
  depto: string;
  referencias: string;
};

const EMPTY_VALUES: DomicilioForm = {
  calle: "",
  numero: "",
  complejo: "",
  piso: "",
  depto: "",
  referencias: "",
};

export default function CreateDomicilioForm({
  clienteId,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<DomicilioForm>({
    defaultValues: EMPTY_VALUES,
  });

  const createMutation = useCreateDomicilio();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    clearErrors();
    setErrorMsg(null);
    reset(EMPTY_VALUES);
  }, [clearErrors, reset]);

  const handleError = (error: any) => {
    const response = error?.response?.data;

    if (response?.detail && Array.isArray(response.detail)) {
      response.detail.forEach((err: any) => {
        const field = err.loc?.[1];
        let message = err.msg;

        if (typeof err.msg === "string" && err.msg.includes("field required")) {
          message = "Campo obligatorio";
        }

        if (field) {
          setError(field as keyof DomicilioForm, {
            type: "server",
            message,
          });
        }
      });
      return;
    }

    if (typeof response?.detail === "string") {
      setErrorMsg(response.detail);
      return;
    }

    setErrorMsg("Error al crear domicilio");
  };

  const onSubmit = (data: DomicilioForm) => {
    setErrorMsg(null);
    clearErrors();

    createMutation.mutate(
      {
        clienteId,
        data: {
          calle: data.calle.trim() || undefined,
          numero: data.numero.trim() ? Number(data.numero) : null,
          complejo: data.complejo.trim() || undefined,
          piso: data.piso.trim() ? Number(data.piso) : null,
          depto: data.depto.trim() || undefined,
          referencias: data.referencias.trim() || undefined,
          estado_domicilio_id: 1,
        },
      },
      {
        onSuccess: () => {
          reset(EMPTY_VALUES);
          onSuccess?.();
        },
        onError: handleError,
      }
    );
  };

  const isPending = createMutation.isPending;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <TextField
        label="Calle"
        {...register("calle", {
          required: "La calle es obligatoria",
        })}
        error={!!errors.calle}
        helperText={errors.calle?.message}
        fullWidth
      />

      <TextField
        label="Número"
        {...register("numero", {
          required: "El número es obligatorio",
        })}
        error={!!errors.numero}
        helperText={errors.numero?.message}
        fullWidth
      />

      <TextField
        label="Complejo"
        {...register("complejo")}
        error={!!errors.complejo}
        helperText={errors.complejo?.message}
        fullWidth
      />

      <TextField
        label="Piso"
        {...register("piso")}
        error={!!errors.piso}
        helperText={errors.piso?.message}
        fullWidth
      />

      <TextField
        label="Depto"
        {...register("depto")}
        error={!!errors.depto}
        helperText={errors.depto?.message}
        fullWidth
      />

      <TextField
        label="Referencias"
        {...register("referencias")}
        error={!!errors.referencias}
        helperText={errors.referencias?.message}
        fullWidth
        multiline
        minRows={2}
      />

      <Button type="submit" variant="contained" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar domicilio"}
      </Button>
    </Box>
  );
}