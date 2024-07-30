"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";

interface NotificacionInterna {
  id: number;
  fecha: string;
  titulo: string;
  texto: string;
  leida: boolean;
  tipo: string;
}

const NotificacionesInternas = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notificaciones, setNotificaciones] = useState<NotificacionInterna[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const { authFetch } = useFetch();

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(
        "/api/notificaciones-internas",
        window.location.origin
      );
      url.searchParams.append("page", paginationModel.page.toString());
      url.searchParams.append("size", paginationModel.pageSize.toString());

      if (tabValue === 1) {
        url.searchParams.append("leidas", "false");
      } else if (tabValue === 2) {
        url.searchParams.append("leidas", "true");
      }

      const response = await authFetch(url.toString());
      const data = await response.json();
      setNotificaciones(data.items || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      setNotificaciones([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, tabValue, authFetch]);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleLeidaChange = async (id: number, newValue: boolean) => {
    try {
      await authFetch(`/api/notificaciones-internas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leida: newValue }),
      });
      fetchNotificaciones();
    } catch (error) {
      console.error("Error al actualizar notificación:", error);
    }
  };

  const columns: GridColDef[] = [
    { field: "fecha", headerName: "Fecha", flex: 1 },
    { field: "titulo", headerName: "Título", flex: 2 },
    { field: "texto", headerName: "Texto", flex: 3 },
    {
      field: "leida",
      headerName: "Leída",
      flex: 1,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.leida}
              onChange={(e) =>
                handleLeidaChange(params.row.id, e.target.checked)
              }
            />
          }
          label={params.row.leida ? "Sí" : "No"}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h5" component="h2" gutterBottom>
        Notificaciones Internas
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Todas" />
          <Tab label="No leídas" />
          <Tab label="Leídas" />
        </Tabs>
      </Box>
      <Box sx={{ height: 400, width: "100%", mt: 2 }}>
        {loading && <CircularProgress />}
        {!loading && (
          <DataGrid
            rows={notificaciones}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 30]}
            rowCount={totalItems}
            paginationMode="server"
            loading={loading}
            getRowId={(row) => row.id}
          />
        )}
      </Box>
    </div>
  );
};

export default NotificacionesInternas;
