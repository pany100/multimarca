"use client";
import { useFetch } from "@/contexts/FetchContext";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { EstadoOrdenReparacion } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrdenReparacion {
  id: string;
  fecha: string;
  status: string;
  auto: {
    patent: string;
    owner: {
      fullName: string;
    };
  };
}

const OrdenesReparacionPage = () => {
  const [ordenes, setOrdenes] = useState<OrdenReparacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [tabValue, setTabValue] = useState(0);
  const [estadoActual, setEstadoActual] = useState<
    EstadoOrdenReparacion | string | null
  >(null);

  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { authFetch } = useFetch();
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "fechaEntradaReparacion",
      headerName: "Fecha Entrada a Taller",
      flex: 1,
      valueGetter: (fechaEntradaReparacion: string) => {
        return fechaEntradaReparacion
          ? new Date(fechaEntradaReparacion).toLocaleDateString("es-AR")
          : "No ingresado";
      },
    },
    {
      field: "vehículo",
      headerName: "Auto",
      flex: 2,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {params.row.auto.brand} {params.row.auto.model}
          </Typography>
          <Typography>{params.row.auto.patent}</Typography>
        </Box>
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={
            estadosDisplay[params.value as EstadoOrdenReparacion] ||
            params.value
          }
          sx={{
            backgroundColor:
              estadoColors[params.value as EstadoOrdenReparacion] ||
              "transparent",
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1,
      renderCell: (params: any) => params.row.auto.owner.fullName,
    },
    {
      field: "observacionesCliente",
      headerName: "Observaciones",
      flex: 2,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {params.row.observacionesCliente}
          </Typography>
        </Box>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 200,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handleEditClick(params.row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              router.push(`/dashboard/ordenes-reparacion/${params.row.id}/ver`)
            }
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
        </>
      ),
    },
  ];
  const estados = [
    "TODOS",
    EstadoOrdenReparacion.Presupuestado,
    EstadoOrdenReparacion.Aceptado,
    EstadoOrdenReparacion.EnProgreso,
    EstadoOrdenReparacion.Terminado,
  ];
  const estadosDisplay: Record<EstadoOrdenReparacion, string> = {
    [EstadoOrdenReparacion.Presupuestado]: "Presupuestado",
    [EstadoOrdenReparacion.Aceptado]: "Aceptado",
    [EstadoOrdenReparacion.EnProgreso]: "En Progreso",
    [EstadoOrdenReparacion.Terminado]: "Terminado",
  };
  const estadoColors = {
    [EstadoOrdenReparacion.Presupuestado]: "#FFA500",
    [EstadoOrdenReparacion.Aceptado]: "#FFD700",
    [EstadoOrdenReparacion.EnProgreso]: "#4169E1",
    [EstadoOrdenReparacion.Terminado]: "#32CD32",
  };

  useEffect(() => {
    const fetchOrdenes = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/orden-reparacion", window.location.origin);
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);
        if (estadoActual && estadoActual !== "TODOS") {
          url.searchParams.append("estado", estadoActual);
        }

        const response = await authFetch(url.toString());
        const data = await response.json();
        setOrdenes(data.items);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener órdenes de reparación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
  }, [paginationModel, authFetch, searchTerm, estadoActual]);

  const handleAddClick = () => {
    router.push("/dashboard/ordenes-reparacion/nueva");
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/ordenes-reparacion/${id}/editar`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on new search
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ): any => {
    setTabValue(newValue);
    setEstadoActual(estados[newValue]);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on tab change
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Órdenes de Reparación
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddClick}
        style={{ marginBottom: "1rem" }}
      >
        Agregar Orden de Reparación
      </Button>
      <Tabs value={tabValue} onChange={handleTabChange}>
        {estados.map((estado) => (
          <Tab
            key={estado}
            label={
              estado === EstadoOrdenReparacion.EnProgreso
                ? "En Progreso"
                : estado
            }
          />
        ))}
      </Tabs>
      <TextField
        label="Buscar"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
      <DataGrid
        rows={ordenes}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        rowCount={totalItems}
        paginationMode="server"
        loading={loading}
        getRowId={(row) => row.id}
        autoHeight
      />
    </Box>
  );
};

export default OrdenesReparacionPage;
