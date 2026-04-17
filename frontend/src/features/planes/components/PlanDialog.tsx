import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { PlanForm } from "./PlanForm";
import type { Plan, PlanCreateInput } from "../types/plan";

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PlanCreateInput) => void | Promise<void>;
  title: string;
  defaultValues?: Partial<Plan>;
  isSubmitting?: boolean;
}

export function PlanDialog({
  open,
  onClose,
  onSubmit,
  title,
  defaultValues,
  isSubmitting = false,
}: PlanDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (isSubmitting && reason !== "escapeKeyDown") {
          return;
        }
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <PlanForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}