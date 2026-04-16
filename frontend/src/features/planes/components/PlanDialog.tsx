import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { PlanForm } from "./PlanForm";
import type { Plan, PlanCreateInput } from "../types/plan";

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PlanCreateInput) => void;
  title: string;
  defaultValues?: Partial<Plan>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function PlanDialog({
  open,
  onClose,
  onSubmit,
  title,
  defaultValues,
  isSubmitting = false,
  errorMessage,
}: PlanDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        )}

        <PlanForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}