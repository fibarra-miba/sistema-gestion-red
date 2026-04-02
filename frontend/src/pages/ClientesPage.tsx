import { useState } from "react";
import { useClientes } from "../features/clientes/hooks/useClientes";
import CreateClienteDialog from "../features/clientes/components/CreateClienteDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";

const ClientesPage = () => {
  const { data, isLoading, isError } = useClientes();
  const [open, setOpen] = useState(false);

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Clientes 👥
        </Typography>

        <Button variant="contained" onClick={() => setOpen(true)}>
          Nuevo cliente
        </Button>
      </Box>

      {/* DIALOG */}
      <CreateClienteDialog open={open} onClose={() => setOpen(false)} />

      {/* LOADING */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* ERROR */}
      {isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar clientes
        </Alert>
      )}

      {/* TABLA */}
      {data && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((cliente: any) => (
                <TableRow key={cliente.cliente_id}>
                  <TableCell>{cliente.cliente_id}</TableCell>
                  <TableCell>{cliente.nombre_cliente}</TableCell>
                  <TableCell>{cliente.apellido_cliente}</TableCell>
                  <TableCell>{cliente.email_cliente}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ClientesPage;