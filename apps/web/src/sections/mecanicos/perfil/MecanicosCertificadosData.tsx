import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { getFormattedDate } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  CardContent,
  Grid,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CertificadoEstudio } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useCertificadoEstudioPersistence from "../hooks/useCertificadoEstudioPersistence";
import DeleteCertificadoEstudioModal from "./DeleteCertificadoEstudioModal";

function MecanicosCertificadosData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCertificado, setSelectedCertificado] =
    useState<CertificadoEstudio | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteCertificadoEstudio } = useCertificadoEstudioPersistence();
  const { setSnackbar } = useSnackbarContext();

  const certificados = empleado?.certificadosEstudio || [];

  const handleAdd = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-certificados`);
    }
  };

  const handleEdit = (cert: CertificadoEstudio) => {
    router.push(`/dashboard/certificados-estudio/${cert.id}/editar`);
  };

  const handleDeleteClick = (cert: CertificadoEstudio) => {
    setSelectedCertificado(cert);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCertificado) return;
    setDeleteLoading(true);
    try {
      await deleteCertificadoEstudio(selectedCertificado.id);
      setDeleteModalOpen(false);
      setSelectedCertificado(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Certificado eliminado correctamente",
        severity: "success",
        open: true,
      });
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al eliminar el certificado",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedCertificado(null);
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.4,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1.5,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 0.8,
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 2,
      valueFormatter: (value) => {
        const str = value as string;
        if (!str) return "-";
        return str.length > 60 ? `${str.slice(0, 60)}...` : str;
      },
    },
    {
      field: "ruta",
      headerName: "Archivo",
      flex: 0.8,
      renderCell: (params) => {
        const ruta = params.value as string | null;
        if (!ruta) return "-";
        return (
          <Link
            href={ruta}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <VisibilityIcon fontSize="small" />
            Ver
          </Link>
        );
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar certificado"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar certificado"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const renderTableContent = () => {
    if (loading) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1">Cargando datos...</Typography>
        </Box>
      );
    }
    if (!certificados.length) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay certificados de estudio registrados
          </Typography>
        </Box>
      );
    }
    return (
      <DataGrid
        rows={certificados}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
            padding: "8px",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-columnHeader": {
            display: "flex",
            alignItems: "center",
          },
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      />
    );
  };

  return (
    <>
      <Box sx={{ bgcolor: "primary.main", color: "white", p: 1.5, mt: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Certificados de Estudio
        </Typography>
      </Box>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderTableContent()}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleAdd}
                disabled={!empleado?.id}
              >
                Agregar Certificado
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteCertificadoEstudioModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        certificado={selectedCertificado}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosCertificadosData;
