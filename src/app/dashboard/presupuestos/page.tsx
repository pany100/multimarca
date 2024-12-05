"use client";
import { useFetch } from "@/contexts/FetchContext";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
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

interface Template {
  id: number;
  nombre: string;
}

const OrdenesReparacionPage = () => {
  const [ordenes, setOrdenes] = useState<OrdenReparacion[]>([]);
  const [borradores, setBorradores] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  const router = useRouter();
  const { authFetch } = useFetch();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPaginationModel({ page: 0, pageSize: 10 });
    setSearchTerm("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  const handleAddTemplateBlank = () => {
    router.push("/dashboard/presupuestos/nuevo");
    setAddModalOpen(false);
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/ordenes-reparacion/${id}/editar`);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleTemplateChange = (event: SelectChangeEvent<number | null>) => {
    const templateId = event.target.value as number | null;
    setSelectedTemplate(templateId);
  };

  const handleAddWithTemplate = () => {
    if (selectedTemplate) {
      router.push(
        `/dashboard/presupuestos/nuevo?templateId=${selectedTemplate}`
      );
    }
    setAddModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const url = new URL("/api/orden-reparacion", window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(`${baseUrl}/${itemToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setOrdenes((prevItems) =>
          prevItems.filter((item) => item.id !== itemToDelete)
        );
        setSnackbar({
          open: true,
          message: `Orden de reparación eliminada con éxito`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error al eliminar la orden de reparación`,
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud DELETE`,
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await authFetch("/api/plantilla-presupuesto");
        const data = await response.json();
        setTemplates(data.items);
      } catch (error) {
        console.error("Error al cargar los templates:", error);
      }
    };

    fetchTemplates();
  }, [authFetch]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url;
        if (tabValue === 0) {
          url = new URL("/api/orden-reparacion", window.location.origin);
          url.searchParams.append(
            "estado",
            EstadoOrdenReparacion.Presupuestado
          );
        } else {
          url = new URL("/api/borradores", window.location.origin);
        }

        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);

        const response = await authFetch(url.toString());
        const data = await response.json();

        if (tabValue === 0) {
          setOrdenes(data.items);
        } else {
          setBorradores(data.items);
        }
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paginationModel, authFetch, searchTerm, tabValue]);

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
      field: "totalAPagar",
      headerName: "Total a Pagar",
      flex: 1,
      renderCell: (params: any) =>
        calcularTotalOrdenReparacion(params.row).toFixed(2),
    },
    {
      field: "totalPagado",
      headerName: "Total Pagado",
      flex: 1,
      renderCell: (params: any) =>
        params.row.ingresos
          .reduce((sum: number, ingreso: any) => sum + Number(ingreso.monto), 0)
          .toFixed(2),
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

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Presupuestos" />
        <Tab label="Borradores" />
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
        rows={tabValue === 0 ? ordenes : borradores}
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

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar este presupuesto?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, px: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <DialogTitle>Nuevo Presupuesto</DialogTitle>
        <DialogContent>
          <Typography>
            Seleccione una opción para agregar un nuevo presupuesto:
          </Typography>
          <Button
            onClick={handleAddTemplateBlank}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            En Blanco
          </Button>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Seleccionar Template</InputLabel>
            <Select
              labelId="template-select-label"
              value={selectedTemplate || ""}
              fullWidth
              onChange={handleTemplateChange}
              label="Seleccionar Template"
            >
              <MenuItem value="">Ninguno</MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, px: 3 }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddWithTemplate}
            variant="contained"
            color="success"
            disabled={!selectedTemplate}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdenesReparacionPage;
