import { Alert, Dialog, DialogContent, DialogTitle } from "@mui/material";
import type { ContratoCreateInput } from "../types/contrato";
import CreateContratoForm from "./CreateContratoForm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ContratoCreateInput) => void | Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const CreateContratoDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo contrato</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        )}

        <CreateContratoForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateContratoDialog;