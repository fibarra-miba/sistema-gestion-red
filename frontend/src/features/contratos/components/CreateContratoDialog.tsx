import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useNotifications } from "../../../components/ui/notifications/useNotifications";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

import type { ContratoCreateInput } from "../types/contrato";
import CreateContratoForm from "./CreateContratoForm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ContratoCreateInput) => Promise<void>;
  isSubmitting?: boolean;
}

const CreateContratoDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) => {
  const { success, error: notifyError } = useNotifications();

  const handleSubmit = async (values: ContratoCreateInput) => {
    try {
      await onSubmit(values);
      success("Contrato creado correctamente.");
    } catch (err: any) {
      notifyError(getErrorMessage(err, "No se pudo crear el contrato."));
    }
  };

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
      <DialogTitle>Nuevo contrato</DialogTitle>

      <DialogContent>
        <CreateContratoForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateContratoDialog;