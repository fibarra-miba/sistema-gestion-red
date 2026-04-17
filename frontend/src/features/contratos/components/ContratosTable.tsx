import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Contrato } from "../types/contrato";

interface Props {
  contratos: Contrato[];
  onView: (contrato: Contrato) => void;
}

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

export const ContratosTable = ({ contratos, onView }: Props) => {
  if (contratos.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          px: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          No hay contratos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No se encontraron contratos con los filtros aplicados.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Inicio</TableCell>
            <TableCell>Fin</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
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
                  color={
                    getEstadoColor(
                      contrato.estado_contrato_descripcion
                    ) as
                      | "default"
                      | "success"
                      | "warning"
                      | "error"
                      | "info"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Ver detalle del contrato">
                  <IconButton
                    onClick={() => onView(contrato)}
                    aria-label={`Ver detalle del contrato ${contrato.contrato_id}`}
                  >
                    <VisibilityOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};