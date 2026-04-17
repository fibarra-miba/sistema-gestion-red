import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../components/ui/PageContainer";
import ContentCard from "../components/ui/ContentCard";

import { useNotifications } from "../components/ui/notifications/useNotifications";
import { getErrorMessage } from "../shared/utils/getErrorMessage";

import { usePlanes } from "../features/planes/hooks/usePlanes";
import { useCreatePlan } from "../features/planes/hooks/useCreatePlan";
import { useUpdatePlan } from "../features/planes/hooks/useUpdatePlan";
import { useDeletePlan } from "../features/planes/hooks/useDeletePlan";
import { PlanDialog } from "../features/planes/components/PlanDialog";
import { PlanesTable } from "../features/planes/components/PlanesTable";

import type { Plan, PlanCreateInput } from "../features/planes/types/plan";

const PlanesTableSkeleton = () => {
  return (
    <Stack spacing={1.25}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={44} />
      ))}
    </Stack>
  );
};

export default function PlanesPage() {
  const { success, error: notifyError } = useNotifications();

  const { data: planes = [], isLoading, isError } = usePlanes();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const [openCreate, setOpenCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const handleCreate = async (values: PlanCreateInput) => {
    try {
      await createPlanMutation.mutateAsync(values);
      setOpenCreate(false);
      success("Plan creado correctamente.");
    } catch (err: any) {
      notifyError(getErrorMessage(err, "No se pudo crear el plan."));
      throw err;
    }
  };

  const handleUpdate = async (values: PlanCreateInput) => {
    if (!editingPlan) return;

    try {
      await updatePlanMutation.mutateAsync({
        planId: editingPlan.plan_id,
        payload: values,
      });

      setEditingPlan(null);
      success("Plan actualizado correctamente.");
    } catch (err: any) {
      notifyError(getErrorMessage(err, "No se pudo actualizar el plan."));
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await deletePlanMutation.mutateAsync(planToDelete.plan_id);
      setPlanToDelete(null);
      success("Plan desactivado correctamente.");
    } catch (err: any) {
      setPlanToDelete(null);
      notifyError(getErrorMessage(err, "No se pudo desactivar el plan."));
    }
  };

  return (
    <PageContainer
      title="Planes"
      subtitle="Gestión y administración de planes"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Nuevo plan
        </Button>
      }
    >
      <ContentCard>
        <Stack sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Typography variant="h6">Listado de planes</Typography>
        </Stack>

        <Divider />

        <Box sx={{ px: 2, py: 2 }}>
          {isLoading && <PlanesTableSkeleton />}

          {isError && !isLoading && (
            <Alert severity="error">
              No se pudieron cargar los planes. Intentá nuevamente.
            </Alert>
          )}

          {!isLoading && !isError && (
            <PlanesTable
              planes={planes}
              onEdit={(plan) => setEditingPlan(plan)}
              onDelete={(plan) => setPlanToDelete(plan)}
            />
          )}
        </Box>
      </ContentCard>

      <PlanDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
        title="Crear plan"
        isSubmitting={createPlanMutation.isPending}
      />

      <PlanDialog
        open={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        onSubmit={handleUpdate}
        title="Editar plan"
        defaultValues={editingPlan ?? undefined}
        isSubmitting={updatePlanMutation.isPending}
      />

      <Dialog
        open={!!planToDelete}
        onClose={() => {
          if (!deletePlanMutation.isPending) {
            setPlanToDelete(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirmar desactivación</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {planToDelete
              ? `Se desactivará el plan "${planToDelete.nombre_plan}".`
              : ""}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setPlanToDelete(null)}
            disabled={deletePlanMutation.isPending}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deletePlanMutation.isPending}
          >
            {deletePlanMutation.isPending ? "Desactivando..." : "Desactivar"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}