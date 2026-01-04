import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import RepuestosModal from "./components/RepuestosModal";
import RepuestosTable from "./components/RepuestosTable";

export interface RepuestoUsado {
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

interface RepuestosSectionProps {
  repuestos: RepuestoUsado[];
  loading: boolean;
  onAddRepuesto: (data: {
    stockId: number;
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
  }) => Promise<boolean>;
  onUpdateRepuesto: (
    id: number,
    data: {
      stockId?: number;
      precioCompra?: number;
      precioVenta?: number;
      unidadesConsumidas?: number;
    }
  ) => Promise<boolean>;
  onDeleteRepuesto: (repuesto: RepuestoUsado) => void;
  deleteConfirmOpen: boolean;
  onDeleteConfirm: () => Promise<void>;
  onDeleteCancel: () => void;
}

const RepuestosSection = ({
  repuestos,
  loading,
  onAddRepuesto,
  onUpdateRepuesto,
  onDeleteRepuesto,
  deleteConfirmOpen,
  onDeleteConfirm,
  onDeleteCancel,
}: RepuestosSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRepuesto, setEditRepuesto] = useState<RepuestoUsado | undefined>();

  const handleSubmit = async (data: {
    stockId: number;
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
  }) => {
    let success = false;

    if (editRepuesto) {
      // Update existing repuesto
      success = await onUpdateRepuesto(editRepuesto.id, data);
    } else {
      // Add new repuesto
      success = await onAddRepuesto(data);
    }

    // Only close modal if operation was successful
    if (success) {
      setModalOpen(false);
      setEditRepuesto(undefined);
    }

    return success;
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
          repuestos={repuestos}
          onEdit={handleEdit}
          onDelete={onDeleteRepuesto}
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
        onClose={onDeleteCancel}
        onConfirm={onDeleteConfirm}
        title="Eliminar repuesto usado"
        message="¿Está seguro que desea eliminar este repuesto usado? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default RepuestosSection;
