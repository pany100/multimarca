"use client";
import { useFetch } from "@/contexts/FetchContext";
import { Box, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

const RecordatoriosPage = () => {
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { authFetch } = useFetch();

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: "Cliente",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Teléfono",
      flex: 1,
    },
    {
      field: "fechaSalidaReparacion",
      headerName: "Fecha Salida de reparación",
      flex: 1.5,
      valueGetter: (fechaSalidaReparacion: string) => {
        return new Date(fechaSalidaReparacion).toLocaleDateString("es-AR");
      },
    },
    {
      field: "descripcion",
      headerName: "Trabajo Realizado",
      flex: 2,
    },
    {
      field: "fechaRecordatorio",
      headerName: "Fecha Recordatorio",
      flex: 1,
      valueGetter: (fechaRecordatorio: string) => {
        return new Date(fechaRecordatorio).toLocaleDateString("es-AR");
      },
    },
    {
      field: "enviado",
      headerName: "Estado",
      flex: 1,
      valueGetter: (enviado: boolean) => (enviado ? "Enviado" : "Pendiente"),
    },
  ];

  useEffect(() => {
    const fetchRecordatorios = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/recordatorios", window.location.origin);
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);

        const response = await authFetch(url.toString());
        const data = await response.json();
        setRecordatorios(data.items);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener recordatorios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordatorios();
  }, [paginationModel, authFetch, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Recordatorios
      </Typography>

      <TextField
        label="Buscar"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />

      <DataGrid
        rows={recordatorios}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        rowCount={totalItems}
        paginationMode="server"
        loading={loading}
        getRowId={(row) => row.fullName + row.fechaRecordatorio}
        autoHeight
      />
    </Box>
  );
};

export default RecordatoriosPage;
