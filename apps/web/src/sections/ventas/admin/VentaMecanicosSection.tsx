import useAllMechanics from "@/hooks/orden-reparacion/useAllMechanics";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import MecanicoModal from "@/sections/ordenes-reparacion/admin/components/MecanicoModal";
import DeleteConfirmDialog from "@/sections/ordenes-reparacion/admin/components/DeleteConfirmDialog";
import { useVenta } from "./contexts/VentaContext";
import { useMecanicoVentaManager } from "./hooks/useMecanicoVentaManager";

interface Empleado {
  id: number;
  name: string;
}

interface Mecanico {
  id: number;
  name: string;
  detalle?: string | null;
  mecanicoVentaId: number;
}

const VentaMecanicosSection = () => {
  const { venta } = useVenta();
  const {
    loading,
    handleAddMecanico,
    handleUpdateMecanico,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useMecanicoVentaManager();

  const { mechanics, loading: loadingEmpleados } = useAllMechanics();

  const [modalOpen, setModalOpen] = useState(false);
  const [editMecanico, setEditMecanico] = useState<Mecanico | undefined>();

  const empleados: Empleado[] = mechanics.map((m) => ({
    id: Number(m.value),
    name: m.label,
  }));

  const mecanicos: Mecanico[] = venta?.mecanicos || [];

  const handleSubmit = async (mecanicoId: number, detalle: string) => {
    let success = false;

    if (editMecanico) {
      success = await handleUpdateMecanico(
        editMecanico.mecanicoVentaId,
        detalle
      );
    } else {
      success = await handleAddMecanico(mecanicoId, detalle);
    }

    if (success) {
      setModalOpen(false);
      setEditMecanico(undefined);
    }
  };

  const handleEdit = (mecanico: Mecanico) => {
    setEditMecanico(mecanico);
    setModalOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Mecánico",
      flex: 1,
    },
    {
      field: "detalle",
      headerName: "Detalle",
      flex: 2,
      renderCell: (params) => params.row.detalle || "-",
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            disabled={loading}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row)}
            disabled={loading}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Mecánicos Asignados
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : !mecanicos || mecanicos.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No hay mecánicos asignados
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={mecanicos}
              columns={columns}
              disableRowSelectionOnClick
              hideFooter
              sx={{
                border: 1,
                borderColor: "divider",
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "primary.light",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                },
                "& .MuiDataGrid-filler": {
                  backgroundColor: "primary.light",
                },
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                },
                "& .MuiDataGrid-row": {
                  maxHeight: "none !important",
                },
              }}
              getRowHeight={() => "auto"}
            />
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditMecanico(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Mecánico
          </Button>
        </Box>
      </CardContent>

      <MecanicoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditMecanico(undefined);
        }}
        onSubmit={handleSubmit}
        empleados={empleados}
        loading={loading || loadingEmpleados}
        isEdit={!!editMecanico}
        initialDetalle={editMecanico?.detalle || ""}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar mecánico"
        message="¿Está seguro que desea eliminar este mecánico de la venta? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default VentaMecanicosSection;
