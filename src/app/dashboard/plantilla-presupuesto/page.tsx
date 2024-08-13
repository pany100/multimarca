"use client";
import { useFetch } from "@/contexts/FetchContext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PlantillaPresupuesto {
  id: string;
  nombre: string;
}

const PlantillaPresupuestoPage = () => {
  const [plantillas, setPlantillas] = useState<PlantillaPresupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { authFetch } = useFetch();

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handleEditClick(params.row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(params.row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  useEffect(() => {
    const fetchPlantillas = async () => {
      setLoading(true);
      try {
        const url = new URL(
          "/api/plantilla-presupuesto",
          window.location.origin
        );
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);

        const response = await authFetch(url.toString());
        const data = await response.json();
        setPlantillas(data.items);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener plantillas de presupuesto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantillas();
  }, [paginationModel, authFetch, searchTerm]);

  const handleAddClick = () => {
    router.push("/dashboard/plantilla-presupuesto/nuevo");
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/plantilla-presupuesto/${id}/editar`);
  };

  const handleDeleteClick = (id: string) => {
    // Implementar lógica de eliminación
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Plantillas de Presupuesto
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddClick}
        style={{ marginBottom: "1rem" }}
      >
        Agregar Plantilla
      </Button>
      <TextField
        label="Buscar"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
      <DataGrid
        rows={plantillas}
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

export default PlantillaPresupuestoPage;
