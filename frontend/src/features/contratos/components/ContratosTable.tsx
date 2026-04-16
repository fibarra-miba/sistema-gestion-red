import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import type { Contrato } from "../types/contrato";

interface Props {
  contratos: Contrato[];
  onView: (contrato: Contrato) => void;
}

export const ContratosTable = ({ contratos, onView }: Props) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "success";
      case "SUSPENDIDO":
        return "warning";
      case "CANCELADO":
      case "BAJA":
        return "error";
      case "BORRADOR":
        return "default";
      case "PENDIENTE_INSTALACION":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Cliente</TableCell>
          <TableCell>Plan</TableCell>
          <TableCell>Inicio</TableCell>
          <TableCell>Fin</TableCell>
          <TableCell>Estado</TableCell>
          <TableCell>Acciones</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {contratos.map((contrato) => (
          <TableRow key={contrato.contrato_id} hover>
            <TableCell>{contrato.contrato_id}</TableCell>
            <TableCell>
              {contrato.cliente_nombre} {contrato.cliente_apellido}
            </TableCell>
            <TableCell>{contrato.plan_nombre}</TableCell>
            <TableCell>
              {new Date(
                contrato.fecha_inicio_contrato
              ).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {contrato.fecha_fin_contrato
                ? new Date(
                    contrato.fecha_fin_contrato
                  ).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>
              <Chip
                label={contrato.estado_contrato_descripcion}
                color={getEstadoColor(
                  contrato.estado_contrato_descripcion
                ) as any}
                size="small"
              />
            </TableCell>
            <TableCell>
              <IconButton onClick={() => onView(contrato)}>
                <VisibilityOutlinedIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};