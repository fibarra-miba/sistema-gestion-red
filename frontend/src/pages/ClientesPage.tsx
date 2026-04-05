import { useEffect, useState } from "react";
import { useClientes } from "../features/clientes/hooks/useClientes";
import CreateClienteDialog from "../features/clientes/components/CreateClienteDialog";
import ClienteDetailDialog from "../features/clientes/components/ClienteDetailDialog";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Typography,
  Divider,
} from "@mui/material";

import PageContainer from "../components/ui/PageContainer";
import ContentCard from "../components/ui/ContentCard";

const ClientesPage = () => {
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useClientes(search);

  // =========================
  // HANDLERS
  // =========================

  const handleOpenDetail = (cliente: any) => {
    setSelectedCliente(cliente);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  const handleOpenEdit = () => {
    setOpenDetail(false);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setOpenDetail(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <PageContainer
      title="Clientes"
      subtitle="Gestión y administración de clientes"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Nuevo cliente
        </Button>
      }
    >
      <ContentCard>

        {/* 🔥 HEADER PROLIJO */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 2,
            pt: 2,
            pb: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Listado de clientes
          </Typography>

          <TextField
            size="small"
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ width: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        <Divider />

        <Box sx={{ px: 2, py: 2 }}>

          {/* =========================
              CREATE DIALOG
          ========================= */}
          <CreateClienteDialog
            open={openCreate}
            onClose={handleCloseCreate}
          />

          {/* =========================
              LOADING
          ========================= */}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* =========================
              ERROR
          ========================= */}
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error al cargar clientes
            </Alert>
          )}

          {/* =========================
              TABLE
          ========================= */}
          {data && (
            <TableContainer
              sx={{
                maxHeight: "60vh",
                overflow: "auto",
                borderRadius: 2,
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Apellido</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((cliente: any) => (
                    <TableRow
                      key={cliente.cliente_id}
                      hover
                      sx={{
                        "& td": {
                          py: 1.2,
                        },
                      }}
                    >
                      <TableCell>{cliente.cliente_id}</TableCell>
                      <TableCell>{cliente.nombre_cliente}</TableCell>
                      <TableCell>{cliente.apellido_cliente}</TableCell>
                      <TableCell>{cliente.email_cliente}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDetail(cliente)}>
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </Box>
      </ContentCard>

      {/* =========================
          DETAIL DIALOG
      ========================= */}
      <ClienteDetailDialog
        open={openDetail}
        cliente={selectedCliente}
        onClose={handleCloseDetail}
        onEdit={handleOpenEdit}
      />

      {/* =========================
          EDIT DIALOG
      ========================= */}
      <CreateClienteDialog
        open={openEdit}
        onClose={handleCloseEdit}
        cliente={selectedCliente}
      />
    </PageContainer>
  );
};

export default ClientesPage;