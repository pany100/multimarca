"use client";

import authFetch from "@/utils/authFetch";
import { Box, Button, Typography } from "@mui/material";
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

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fechaCreacion", headerName: "Fecha", width: 130 },
    { field: "estado", headerName: "Estado", width: 130 },
    {
      field: "patente",
      headerName: "Patente",
      width: 130,
      renderCell: (params: any) => params.row.auto.patent,
    },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 200,
      renderCell: (params: any) => params.row.auto.owner.fullName,
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      renderCell: (params) => (
        <Button
          onClick={() => handleEditClick(params.row.id)}
          variant="contained"
          color="primary"
          size="small"
        >
          Editar
        </Button>
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
