import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import TercerosModal from "./components/TercerosModal";
import TercerosTable from "./components/TercerosTable";
import { useOrden } from "./contexts/OrdenContext";
import { useTercerosManager } from "./hooks/useTercerosManager";

interface ReparacionTercero {
  id: number;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  proveedor: {
    id: number;
    name: string;
  };
  recibo?: string | null;
}

const TercerosSection = () => {
  const { orden } = useOrden();
  const {
    loading,
    handleAddTercero,
    handleUpdateTercero,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTercerosManager();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTercero, setEditTercero] = useState<
    ReparacionTercero | undefined
  >();

  const handleSubmit = async (data: {
    nombre: string;
    proveedorId: number;
    precioCompra: number;
    precioVenta: number;
    recibo?: string | null;
  }) => {
    let success = false;

    if (editTercero) {
      // Update existing tercero
      success = await handleUpdateTercero(editTercero.id, data);
    } else {
      // Add new tercero
      success = await handleAddTercero(data);
    }

    if (success) {
      setModalOpen(false);
      setEditTercero(undefined);
    }
  };

  const handleEdit = (tercero: ReparacionTercero) => {
    setEditTercero(tercero);
    setModalOpen(true);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Reparaciones de Terceros
        </Typography>

        <TercerosTable
          terceros={orden?.reparacionesDeTercero || []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditTercero(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Reparación
          </Button>
        </Box>
      </CardContent>

      <TercerosModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTercero(undefined);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        editTercero={editTercero}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar reparación de tercero"
        message="¿Está seguro que desea eliminar esta reparación de tercero? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default TercerosSection;
