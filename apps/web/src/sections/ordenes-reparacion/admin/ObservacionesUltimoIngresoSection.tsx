import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import JsonStringTable from "./components/JsonStringTable";
import ObservacionModal from "./components/ObservacionModal";
import ReparacionesAnteriores from "./components/ReparacionesAnteriores";
import { useOrden } from "./contexts/OrdenContext";
import { useObservacionesManager } from "./hooks/useObservacionesManager";

interface ObservacionesSectionProps {}

const ObservacionesUltimoIngresoSection = () => {
  const { orden } = useOrden();
  const {
    loading,
    handleSubmit,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useObservacionesManager();
  const [modalOpen, setModalOpen] = useState(false);
  const [editValue, setEditValue] = useState<string | undefined>();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Observaciones último ingreso
        </Typography>
        <JsonStringTable
          jsonString={orden?.observacionesEntrada || "[]"}
          columnName="Observaciones"
          onEdit={(item) => {
            setEditValue(item.value);
            setModalOpen(true);
          }}
          onDelete={handleDeleteClick}
          emptyMessage="No hay observaciones"
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
            Agregar Observacion
          </Button>
        </Box>
      </CardContent>

      <ObservacionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditValue(undefined);
        }}
        onSubmit={async (observacion) => {
          const success = await handleSubmit(observacion, editValue);
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
        title="Eliminar observación"
        message="¿Está seguro que desea eliminar esta observación? Esta acción no se puede deshacer."
        loading={loading}
      />
      <Box sx={{ m: 2, mt: 0 }}>
        <ReparacionesAnteriores
          addObservacion={(observacion: string) => handleSubmit(observacion)}
          observacionesActuales={orden?.observacionesEntrada || []}
        />
      </Box>
    </Card>
  );
};

export default ObservacionesUltimoIngresoSection;
