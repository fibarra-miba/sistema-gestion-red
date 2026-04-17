import {
  Box,
  Chip,
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

function getEstadoColor(estadoPlanId: number) {
  return estadoPlanId === 1 ? "success" : "default";
}

export function PlanesTable({
  planes,
  onEdit,
  onDelete,
}: PlanesTableProps) {
  if (!planes.length) {
    return (
      <Box
        sx={{
          py: 6,
          px: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          No hay planes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aún no hay planes cargados.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ overflow: "hidden" }} variant="outlined" elevation={0}>
      <Table size="small">
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
            <TableRow key={plan.plan_id} hover>
              <TableCell>{plan.plan_id}</TableCell>
              <TableCell>{plan.nombre_plan}</TableCell>
              <TableCell>{plan.velocidad_mbps_plan} Mbps</TableCell>
              <TableCell>{plan.descripcion_plan || "-"}</TableCell>
              <TableCell>
                <Chip
                  label={getEstadoLabel(plan.estado_plan_id)}
                  color={getEstadoColor(plan.estado_plan_id) as "success" | "default"}
                  size="small"
                />
              </TableCell>
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