import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Plan } from "../types/plan";

interface PlanesTableProps {
  planes: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

function getEstadoLabel(estadoPlanId: number) {
  return estadoPlanId === 1 ? "ACTIVO" : "INACTIVO";
}

export function PlanesTable({
  planes,
  onEdit,
  onDelete,
}: PlanesTableProps) {
  if (!planes.length) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No hay planes cargados.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Velocidad</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {planes.map((plan) => (
            <TableRow key={plan.plan_id}>
              <TableCell>{plan.plan_id}</TableCell>
              <TableCell>{plan.nombre_plan}</TableCell>
              <TableCell>{plan.velocidad_mbps_plan} Mbps</TableCell>
              <TableCell>{plan.descripcion_plan || "-"}</TableCell>
              <TableCell>{getEstadoLabel(plan.estado_plan_id)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Editar plan">
                    <IconButton onClick={() => onEdit(plan)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Desactivar plan">
                    <IconButton onClick={() => onDelete(plan)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}