import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../components/ui/PageContainer";
import ContentCard from "../components/ui/ContentCard";

import { useContratos } from "../features/contratos/hooks/useContratos";
import { useCreateContrato } from "../features/contratos/hooks/useCreateContrato";

import { ContratosTable } from "../features/contratos/components/ContratosTable";
import ContratoDetailDialog from "../features/contratos/components/ContratoDetailDialog";
import CreateContratoDialog from "../features/contratos/components/CreateContratoDialog";
import ContratosFilters from "../features/contratos/components/ContratosFilters";

import type {
  Contrato,
  ContratoCreateInput,
} from "../features/contratos/types/contrato";

type ContratosPageFilters = {
  search?: string;
  estado_contrato_id?: number;
  plan_id?: number;
};

const ContratosTableSkeleton = () => {
  return (
    <Stack spacing={1.25}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={44} />
      ))}
    </Stack>
  );
};

const ContratosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get("search");
  const estadoIdFromUrl = searchParams.get("estado_contrato_id");
  const planIdFromUrl = searchParams.get("plan_id");

  const initialFilters = useMemo<ContratosPageFilters>(
    () => ({
      search: searchFromUrl ?? "",
      estado_contrato_id: estadoIdFromUrl ? Number(estadoIdFromUrl) : undefined,
      plan_id: planIdFromUrl ? Number(planIdFromUrl) : undefined,
    }),
    [searchFromUrl, estadoIdFromUrl, planIdFromUrl]
  );

  const [filters, setFilters] = useState<ContratosPageFilters>(initialFilters);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filtersDirty, setFiltersDirty] = useState(
    !!initialFilters.search ||
      !!initialFilters.estado_contrato_id ||
      !!initialFilters.plan_id
  );

  useEffect(() => {
    setFilters(initialFilters);
    setFiltersDirty(
      !!initialFilters.search ||
        !!initialFilters.estado_contrato_id ||
        !!initialFilters.plan_id
    );
  }, [initialFilters]);

  const serverFilters = useMemo(
    () => ({
      estado_contrato_id: filters.estado_contrato_id,
      plan_id: filters.plan_id,
    }),
    [filters.estado_contrato_id, filters.plan_id]
  );

  const { data = [], isLoading, isError } = useContratos(serverFilters);
  const createContratoMutation = useCreateContrato();

  const [selectedContratoId, setSelectedContratoId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ contratoId: number }>;
      if (customEvent.detail?.contratoId) {
        setSelectedContratoId(customEvent.detail.contratoId);
      }
    };

    window.addEventListener("open-contrato-detail", handler);
    return () => window.removeEventListener("open-contrato-detail", handler);
  }, []);

  const errorMessage = useMemo(() => {
    const err = createContratoMutation.error as any;
    return err?.response?.data?.detail || null;
  }, [createContratoMutation.error]);

  const filteredData = useMemo(() => {
    const search = (filters.search ?? "").trim().toLowerCase();

    if (!search) {
      return data;
    }

    return data.filter((contrato: Contrato) => {
      const cliente =
        `${contrato.cliente_nombre} ${contrato.cliente_apellido}`.toLowerCase();

      return cliente.includes(search);
    });
  }, [data, filters.search]);

  const updateSearchParams = (nextFilters: ContratosPageFilters) => {
    const next = new URLSearchParams();

    if (nextFilters.search?.trim()) {
      next.set("search", nextFilters.search.trim());
    }

    if (nextFilters.estado_contrato_id !== undefined) {
      next.set("estado_contrato_id", String(nextFilters.estado_contrato_id));
    }

    if (nextFilters.plan_id !== undefined) {
      next.set("plan_id", String(nextFilters.plan_id));
    }

    setSearchParams(next);
  };

  const handleFilter = (nextFilters: ContratosPageFilters) => {
    setFilters(nextFilters);
    updateSearchParams(nextFilters);
  };

  const handleCreate = async (values: ContratoCreateInput) => {
    await createContratoMutation.mutateAsync(values);
    setOpenCreate(false);
  };

  const handleResetFilters = () => {
    const nextFilters: ContratosPageFilters = { search: "" };
    setFilters(nextFilters);
    setFiltersDirty(false);
    setSearchParams(new URLSearchParams());
  };

  return (
    <PageContainer
      title="Contratos"
      subtitle="Gestión y administración de contratos"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Nuevo contrato
        </Button>
      }
    >
      <ContentCard>
        <Box sx={{ px: 2, py: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: filtersExpanded ? 2 : 0 }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <FilterListIcon fontSize="small" />
              <Typography variant="h6">Filtros</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {filtersDirty && (
                <Button variant="outlined" size="small" onClick={handleResetFilters}>
                  Limpiar filtros
                </Button>
              )}

              <IconButton
                onClick={() => setFiltersExpanded((prev) => !prev)}
                aria-label={filtersExpanded ? "Ocultar filtros" : "Mostrar filtros"}
              >
                {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
          </Stack>

          <Collapse in={filtersExpanded}>
            <ContratosFilters
              value={filters}
              onFilter={handleFilter}
              onDirtyChange={setFiltersDirty}
            />
          </Collapse>
        </Box>
      </ContentCard>

      <ContentCard>
        <Stack sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Typography variant="h6">Listado de contratos</Typography>
        </Stack>

        <Divider />

        <Box sx={{ px: 2, py: 2 }}>
          {isLoading && <ContratosTableSkeleton />}

          {isError && !isLoading && (
            <Alert severity="error">
              Error al cargar contratos. Intentá nuevamente.
            </Alert>
          )}

          {!isLoading && !isError && (
            <ContratosTable
              contratos={filteredData}
              onView={(contrato) => setSelectedContratoId(contrato.contrato_id)}
            />
          )}
        </Box>
      </ContentCard>

      <ContratoDetailDialog
        open={!!selectedContratoId}
        contratoId={selectedContratoId}
        onClose={() => setSelectedContratoId(null)}
      />

      <CreateContratoDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
        isSubmitting={createContratoMutation.isPending}
        errorMessage={errorMessage}
      />
    </PageContainer>
  );
};

export default ContratosPage;