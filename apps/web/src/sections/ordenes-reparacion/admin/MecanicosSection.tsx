import useAllMechanics from "@/hooks/orden-reparacion/useAllMechanics";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import MecanicoModal from "./components/MecanicoModal";
import MecanicosTable from "./components/MecanicosTable";
import { useOrden } from "./contexts/OrdenContext";
import { useMecanicoManager } from "./hooks/useMecanicoManager";

interface Empleado {
  id: number;
  name: string;
}

interface Mecanico {
  id: number;
  name: string;
  detalle?: string | null;
  mecanicoOrdenRepId: number;
}

const MecanicosSection = () => {
  const { orden } = useOrden();
  const {
    loading,
    handleAddMecanico,
    handleUpdateMecanico,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useMecanicoManager();

  const { mechanics, loading: loadingEmpleados } = useAllMechanics();

  const [modalOpen, setModalOpen] = useState(false);
  const [editMecanico, setEditMecanico] = useState<Mecanico | undefined>();

  // Convert mechanics format to empleados format
  const empleados: Empleado[] = mechanics.map((m) => ({
    id: Number(m.value),
    name: m.label,
  }));

  const handleSubmit = async (mecanicoId: number, detalle: string) => {
    let success = false;

    if (editMecanico) {
      // Update existing mecanico
      success = await handleUpdateMecanico(
        editMecanico.mecanicoOrdenRepId,
        detalle
      );
    } else {
      // Add new mecanico
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

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Mecánicos Asignados
        </Typography>

        <MecanicosTable
          mecanicos={orden?.mecanicos || []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

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
        message="¿Está seguro que desea eliminar este mecánico de la orden? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default MecanicosSection;
