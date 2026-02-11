"use client";

import { useFetch } from "@/contexts/FetchContext";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
    [],
  );
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const { authFetch } = useFetch();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notificacionToUpdate, setNotificacionToUpdate] =
    useState<NotificacionInterna | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(
        "/api/notificaciones-internas",
        window.location.origin,
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

  const handleLeidaChange = (notificacion: NotificacionInterna) => {
    setNotificacionToUpdate(notificacion);
    setConfirmDialogOpen(true);
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await authFetch("/api/notificaciones-internas/marcar-todas-leidas", {
        method: "POST",
      });
      fetchNotificaciones();
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleConfirmLeidaChange = async () => {
    if (!notificacionToUpdate) return;

    const newValue = !notificacionToUpdate.leida;
    try {
      await authFetch(
        `/api/notificaciones-internas/${notificacionToUpdate.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leida: newValue }),
        },
      );
      fetchNotificaciones();
    } catch (error) {
      console.error("Error al actualizar notificación:", error);
    } finally {
      setConfirmDialogOpen(false);
      setNotificacionToUpdate(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: "titulo",
      headerName: "Título",
      flex: 2,
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "texto",
      headerName: "Texto",
      flex: 3,
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "leida",
      headerName: "Leída",
      flex: 1,
      renderCell: (params) => (params.row.leida ? "Sí" : "No"),
    },
    {
      field: "accion",
      headerName: "Acción",
      flex: 2,
      renderCell: (params) => (
        <Button
          onClick={() => handleLeidaChange(params.row)}
          startIcon={params.row.leida ? <CloseIcon /> : <CheckIcon />}
        >
          {params.row.leida ? "Marcar como no leída" : "Marcar como leída"}
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h5" component="h2" gutterBottom>
        Notificaciones Internas
      </Typography>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="No leídas" />
          <Tab label="Leídas" />
          <Tab label="Todas" />
        </Tabs>
        {tabValue === 0 && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead || totalItems === 0}
            startIcon={
              markingAllRead ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckIcon />
              )
            }
          >
            Marcar todas como leídas
          </Button>
        )}
      </Box>
      <Box sx={{ width: "100%", mt: 2 }}>
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
            filterMode="server"
            loading={loading}
            getRowId={(row) => row.id}
            getRowHeight={() => "auto"}
            sx={{
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
                minHeight: "50px",
              },
              "& .MuiDataGrid-row": {
                minHeight: "50px !important",
              },
            }}
          />
        )}
      </Box>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar cambio de estado</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea cambiar el estado de esta notificación?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, px: 3 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmLeidaChange}
            variant="contained"
            color="primary"
            autoFocus
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NotificacionesInternas;
