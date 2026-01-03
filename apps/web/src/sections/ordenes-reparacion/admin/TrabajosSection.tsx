import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import TrabajosModal from "./components/TrabajosModal";
import TrabajosTable from "./components/TrabajosTable";
import { useOrden } from "./contexts/OrdenContext";
import { useTrabajosManager } from "./hooks/useTrabajosManager";

interface TrabajoRealizado {
  id: number;
  precioUnitario: number;
  descripcion: string;
  diasParaRecordatorio?: number | null;
}

const TrabajosSection = () => {
  const { orden } = useOrden();
  const {
    loading,
    handleAddTrabajo,
    handleUpdateTrabajo,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTrabajosManager();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTrabajo, setEditTrabajo] = useState<
    TrabajoRealizado | undefined
  >();

  const handleSubmit = async (data: {
    precioUnitario: number;
    descripcion: string;
    diasParaRecordatorio?: number | null;
  }) => {
    if (editTrabajo) {
      // Update existing trabajo
      await handleUpdateTrabajo(editTrabajo.id, data);
    } else {
      // Add new trabajo
      await handleAddTrabajo(data);
    }

    // Always close modal after operation (success or error)
    setModalOpen(false);
    setEditTrabajo(undefined);
  };

  const handleEdit = (trabajo: TrabajoRealizado) => {
    setEditTrabajo(trabajo);
    setModalOpen(true);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Trabajos Realizados
        </Typography>

        <TrabajosTable
          trabajos={orden?.trabajosRealizados || []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditTrabajo(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Trabajo
          </Button>
        </Box>
      </CardContent>

      <TrabajosModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTrabajo(undefined);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        editTrabajo={editTrabajo}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar trabajo realizado"
        message="¿Está seguro que desea eliminar este trabajo realizado? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default TrabajosSection;
