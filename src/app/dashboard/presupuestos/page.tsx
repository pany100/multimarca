"use client";

import authFetch from "@/utils/authFetch";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Presupuesto {
  id: string;
  fechaCreacion: string;
  estado: string;
  auto: {
    patent: string;
    owner: {
      fullName: string;
    };
  };
}

const PresupuestosPage = () => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
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
    const fetchPresupuestos = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/orden-reparacion", window.location.origin);
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        url.searchParams.append("presupuestos", "true");

        const response = await authFetch(url.toString());
        const data = await response.json();
        setPresupuestos(data.items);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener presupuestos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuestos();
  }, [paginationModel]);

  const handleAddClick = () => {
    router.push("/dashboard/presupuestos/nuevo");
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/presupuestos/${id}`);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Presupuestos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddClick}
        style={{ marginBottom: "1rem" }}
      >
        Agregar Presupuesto
      </Button>
      <DataGrid
        rows={presupuestos}
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

export default PresupuestosPage;
