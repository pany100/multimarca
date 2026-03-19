import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import JsonStringTable from "./components/JsonStringTable";
import ObservacionModal from "./components/ObservacionModal";
import { useOrden } from "./contexts/OrdenContext";
import { useDetallesManager } from "./hooks/useDetallesManager";

const DetallesSection = () => {
  const { orden } = useOrden();
  const {
    loading,
    handleSubmit,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useDetallesManager();
  const [modalOpen, setModalOpen] = useState(false);
  const [editValue, setEditValue] = useState<string | undefined>();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Trabajos Realizados
        </Typography>
        <JsonStringTable
          jsonString={orden?.detalleControles || "[]"}
          columnName="Detalles"
          onEdit={(item) => {
            setEditValue(item.value);
            setModalOpen(true);
          }}
          onDelete={handleDeleteClick}
          emptyMessage="No hay detalles"
          loading={loading}
        />
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditValue(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Trabajo Realizado
          </Button>
        </Box>
      </CardContent>

      <ObservacionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditValue(undefined);
        }}
        onSubmit={async (detalle) => {
          const success = await handleSubmit(detalle, editValue);
          if (success) {
            setModalOpen(false);
            setEditValue(undefined);
          }
        }}
        initialValue={editValue}
        loading={loading}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar detalle"
        message="¿Está seguro que desea eliminar este detalle? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default DetallesSection;
