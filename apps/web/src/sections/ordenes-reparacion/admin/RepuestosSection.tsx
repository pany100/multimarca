import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import RepuestosModal from "./components/RepuestosModal";
import RepuestosTable from "./components/RepuestosTable";
import { useOrden } from "./contexts/OrdenContext";
import { useRepuestosManager } from "./hooks/useRepuestosManager";

interface RepuestoUsado {
  id: number;
  stockId: number;
  precioCompra: number;
  precioVenta: number;
  unidadesConsumidas: number;
  stock: {
    id: number;
    nombre: string;
  };
}

const RepuestosSection = () => {
  const { orden } = useOrden();
  const {
    loading,
    handleAddRepuesto,
    handleUpdateRepuesto,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useRepuestosManager();

  const [modalOpen, setModalOpen] = useState(false);
  const [editRepuesto, setEditRepuesto] = useState<RepuestoUsado | undefined>();

  const handleSubmit = async (data: {
    stockId: number;
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
  }) => {
    if (editRepuesto) {
      // Update existing repuesto
      await handleUpdateRepuesto(editRepuesto.id, data);
    } else {
      // Add new repuesto
      await handleAddRepuesto(data);
    }

    // Always close modal after operation (success or error)
    setModalOpen(false);
    setEditRepuesto(undefined);
  };

  const handleEdit = (repuesto: RepuestoUsado) => {
    setEditRepuesto(repuesto);
    setModalOpen(true);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Repuestos Utilizados
        </Typography>

        <RepuestosTable
          repuestos={orden?.repuestosUsados || []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditRepuesto(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Repuesto
          </Button>
        </Box>
      </CardContent>

      <RepuestosModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditRepuesto(undefined);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        editRepuesto={editRepuesto}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar repuesto usado"
        message="¿Está seguro que desea eliminar este repuesto usado? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default RepuestosSection;
