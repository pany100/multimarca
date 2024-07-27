"use client";

import { useFetch } from "@/contexts/FetchContext";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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
  const [totalItems, setTotalItems] = useState(0);
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
    { field: "estado", headerName: "Estado", flex: 1 },
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

  useEffect(() => {
    const fetchOrdenes = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/orden-reparacion", window.location.origin);
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());

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
  }, [paginationModel]);

  const handleAddClick = () => {
    router.push("/dashboard/ordenes-reparacion/nueva");
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/ordenes-reparacion/${id}/editar`);
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
