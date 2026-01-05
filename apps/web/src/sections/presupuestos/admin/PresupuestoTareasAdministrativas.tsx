import useUsersAutocomplete from "@/hooks/useUsersAutocomplete";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "../../ordenes-reparacion/admin/components/DeleteConfirmDialog";
import TareaAdministrativaModal from "./components/TareaAdministrativaModal";
import TareasAdministrativasTable from "./components/TareasAdministrativasTable";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import { useTareaAdministrativaManager } from "./hooks/useTareaAdministrativaManager";

interface Usuario {
  id: number;
  fullName: string;
}

interface TareaAdministrativa {
  id: number;
  descripcion: string;
  usuario: {
    id: number;
    fullName: string;
  };
}

const PresupuestoTareasAdministrativas = () => {
  const { presupuesto } = usePresupuestoRequired();
  const {
    loading,
    handleAddTarea,
    handleUpdateTarea,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTareaAdministrativaManager();

  const { searchUsers, initialUser } = useUsersAutocomplete();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarea, setEditTarea] = useState<TareaAdministrativa | undefined>();

  // Get usuarios from the autocomplete hook
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Load usuarios when needed
  const loadUsuarios = async () => {
    try {
      const result = await searchUsers("");
      const usuariosData = result.map((u: any) => ({
        id: Number(u.value),
        fullName: u.label,
      }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error loading usuarios:", error);
    }
  };

  const handleOpenModal = () => {
    loadUsuarios();
    setModalOpen(true);
  };

  const handleSubmit = async (usuarioId: number, descripcion: string) => {
    let success = false;

    if (editTarea) {
      // Update existing tarea
      success = await handleUpdateTarea(editTarea.id, usuarioId, descripcion);
    } else {
      // Add new tarea
      success = await handleAddTarea(usuarioId, descripcion);
    }

    if (success) {
      setModalOpen(false);
      setEditTarea(undefined);
    }
  };

  const handleEdit = (tarea: TareaAdministrativa) => {
    setEditTarea(tarea);
    loadUsuarios();
    setModalOpen(true);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Tareas Administrativas
        </Typography>

        <TareasAdministrativasTable
          tareas={presupuesto?.tareasAdministrativas || []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditTarea(undefined);
              handleOpenModal();
            }}
            sx={{ mt: 1 }}
          >
            Agregar Tarea
          </Button>
        </Box>
      </CardContent>

      <TareaAdministrativaModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarea(undefined);
        }}
        onSubmit={handleSubmit}
        usuarios={usuarios}
        loading={loading}
        isEdit={!!editTarea}
        initialDescripcion={editTarea?.descripcion || ""}
        initialUsuarioId={editTarea?.usuario.id}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar tarea administrativa"
        message="¿Está seguro que desea eliminar esta tarea administrativa? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default PresupuestoTareasAdministrativas;
