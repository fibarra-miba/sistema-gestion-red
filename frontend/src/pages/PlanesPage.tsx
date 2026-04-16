import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import { usePlanes } from "../features/planes/hooks/usePlanes";
import { useCreatePlan } from "../features/planes/hooks/useCreatePlan";
import { useUpdatePlan } from "../features/planes/hooks/useUpdatePlan";
import { useDeletePlan } from "../features/planes/hooks/useDeletePlan";
import { PlanDialog } from "../features/planes/components/PlanDialog";
import { PlanesTable } from "../features/planes/components/PlanesTable";
import type { Plan, PlanCreateInput } from "../features/planes/types/plan";

export default function PlanesPage() {
  const { data: planes = [], isLoading, isError } = usePlanes();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const [openCreate, setOpenCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const errorMessage = useMemo(() => {
    const createError = createPlanMutation.error as any;
    const updateError = updatePlanMutation.error as any;
    const deleteError = deletePlanMutation.error as any;

    return (
      createError?.response?.data?.detail ||
      updateError?.response?.data?.detail ||
      deleteError?.response?.data?.detail ||
      null
    );
  }, [
    createPlanMutation.error,
    updatePlanMutation.error,
    deletePlanMutation.error,
  ]);

  const handleCreate = async (values: PlanCreateInput) => {
    await createPlanMutation.mutateAsync(values);
    setOpenCreate(false);
    setSnackbarMessage("Plan creado correctamente.");
  };

  const handleUpdate = async (values: PlanCreateInput) => {
    if (!editingPlan) return;

    await updatePlanMutation.mutateAsync({
      planId: editingPlan.plan_id,
      payload: values,
    });

    setEditingPlan(null);
    setSnackbarMessage("Plan actualizado correctamente.");
  };

  const handleDelete = async (plan: Plan) => {
    await deletePlanMutation.mutateAsync(plan.plan_id);
    setSnackbarMessage("Plan desactivado correctamente.");
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box mt={4}>
        <Alert severity="error">No se pudieron cargar los planes.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Planes</Typography>

        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          Nuevo plan
        </Button>
      </Stack>

      <PlanesTable
        planes={planes}
        onEdit={(plan) => setEditingPlan(plan)}
        onDelete={handleDelete}
      />

      <PlanDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
        title="Crear plan"
        isSubmitting={createPlanMutation.isPending}
        errorMessage={errorMessage}
      />

      <PlanDialog
        open={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        onSubmit={handleUpdate}
        title="Editar plan"
        defaultValues={editingPlan ?? undefined}
        isSubmitting={updatePlanMutation.isPending}
        errorMessage={errorMessage}
      />

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={2500}
        onClose={() => setSnackbarMessage(null)}
      >
        <Alert severity="success" onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}