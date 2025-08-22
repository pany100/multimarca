"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Box,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";

interface Cliente {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

const AdminNotificaciones = () => {
  const [tabValue, setTabValue] = useState(0);
  const [clientesNoSilenciados, setClientesNoSilenciados] = useState<Cliente[]>(
    []
  );
  const [clientesSilenciados, setClientesSilenciados] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const { authFetch } = useFetch();

  const fetchClientes = useCallback(
    async (
      endpoint: string,
      setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>
    ) => {
      setLoading(true);
      try {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);

        const response = await authFetch(url.toString());
        const data = await response.json();
        setClientes(data.items || []);
        setTotalItems(data.total || 0);
      } catch (error) {
        console.error("Error fetching clientes:", error);
        setClientes([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [paginationModel.page, paginationModel.pageSize, searchTerm, authFetch]
  );

  useEffect(() => {
    if (tabValue === 0) {
      fetchClientes("/api/clientes/no-silenciados", setClientesNoSilenciados);
    } else {
      fetchClientes("/api/clientes/silenciados", setClientesSilenciados);
    }
  }, [tabValue, fetchClientes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const silenciarCliente = async (id: number) => {
    await authFetch(`/api/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ can_receive_notifications: false }),
    });
    fetchClientes("/api/clientes/no-silenciados", setClientesNoSilenciados);
    fetchClientes("/api/clientes/silenciados", setClientesSilenciados);
  };

  const desilenciarCliente = async (id: number) => {
    await authFetch(`/api/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ can_receive_notifications: true }),
    });
    fetchClientes("/api/clientes/no-silenciados", setClientesNoSilenciados);
    fetchClientes("/api/clientes/silenciados", setClientesSilenciados);
  };

  const columnsNoSilenciados: GridColDef[] = [
    { field: "fullName", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    {
      field: "accion",
      headerName: "Acción",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => silenciarCliente(params.row.id)}
        >
          Silenciar
        </Button>
      ),
    },
  ];

  const columnsSilenciados: GridColDef[] = [
    { field: "fullName", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    {
      field: "accion",
      headerName: "Acción",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => desilenciarCliente(params.row.id)}
        >
          Desilenciar
        </Button>
      ),
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h5" component="h2" gutterBottom>
        Administración de Notificaciones
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Clientes No Silenciados" />
          <Tab label="Clientes Silenciados" />
        </Tabs>
      </Box>
      <TextField
        label="Buscar"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
      <Box sx={{ height: 400, width: "100%", mt: 2 }}>
        {loading && <CircularProgress />}
        {!loading && (
          <DataGrid
            rows={tabValue === 0 ? clientesNoSilenciados : clientesSilenciados}
            columns={tabValue === 0 ? columnsNoSilenciados : columnsSilenciados}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 30]}
            rowCount={totalItems}
            paginationMode="server"
            filterMode="server"
            loading={loading}
            getRowId={(row) => row.id}
          />
        )}
      </Box>
    </div>
  );
};

export default AdminNotificaciones;
