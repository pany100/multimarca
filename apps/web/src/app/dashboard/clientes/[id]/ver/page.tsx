"use client";
import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import {
  calcularTotalOrdenReparacion,
  calcularTotalPagos,
  getStatusColor,
} from "@/utils/ordenHelper";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VerClientePage = ({ params }: { params: { id: string } }) => {
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Clientes")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await authFetch(`/api/clientes/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setCliente(data);
        } else {
          console.error("Error al obtener el cliente");
        }
      } catch (error) {
        console.error("Error al obtener el cliente:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [params.id, authFetch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "fechaCreacion",
      headerName: "Fecha",
      width: 150,
      valueGetter: (fechaCreacion: string) =>
        new Date(fechaCreacion).toLocaleDateString(),
    },
    { field: "observacionesCliente", headerName: "Observaciones", width: 300 },
    {
      field: "estado",
      headerName: "Estado",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.estado}
          color={getStatusColor(params.row.estado)}
        />
      ),
    },
    {
      field: "total",
      headerName: "Monto Total",
      width: 150,
      renderCell: (params: any) =>
        `$${calcularTotalOrdenReparacion(params.row)}`,
    },
    {
      field: "ingresos",
      headerName: "Deuda",
      width: 250,
      renderCell: (params: any) => {
        const total = calcularTotalOrdenReparacion(params.row);
        const aCuenta = calcularTotalPagos(params.row);
        return `$${total - aCuenta}`;
      },
    },
    {
      field: "auto",
      headerName: "Auto",
      width: 250,
      valueGetter: (auto: any) => {
        return `${auto.brand} ${auto.model} (${auto.patent})`;
      },
    },
  ];

  const reparaciones = cliente.cars.flatMap((car: any) =>
    car.ordenesReparacion.map((orden: any) => ({ ...orden, car }))
  );

  const handleReparacionClick = (id: string) => {
    router.push(`/dashboard/ordenes-reparacion/${id}/ver`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, m: 2 }}>
        <Typography variant="h4" gutterBottom>
          Cliente: {cliente.fullName}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Información del Cliente
            </Typography>
            <Typography>
              <strong>Nombre:</strong> {cliente.fullName}
            </Typography>
            <Typography>
              <strong>Teléfono:</strong> {cliente.phone}
            </Typography>
            <Typography>
              <strong>Email:</strong> {cliente.email}
            </Typography>
            <Typography>
              <strong>Dirección:</strong> {cliente.address}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          <BuildIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Reparaciones
        </Typography>
        <DataGrid
          rows={reparaciones}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 30]}
          autoHeight
          onRowClick={(params) => handleReparacionClick(params.row.id)}
          sx={{ cursor: "pointer" }}
        />
      </Paper>
    </Box>
  );
};

export default VerClientePage;
