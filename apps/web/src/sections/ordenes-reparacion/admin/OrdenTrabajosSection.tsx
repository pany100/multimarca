import { useOrden } from "./contexts/OrdenContext";
import { useTrabajosManager } from "./hooks/useTrabajosManager";
import TrabajosSection from "./TrabajosSection";

const OrdenTrabajosSection = () => {
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

  return (
    <TrabajosSection
      trabajos={orden?.trabajosRealizados || []}
      totalManoDeObra={orden?.totalManoDeObra || 0}
      loading={loading}
      onAddTrabajo={handleAddTrabajo}
      onUpdateTrabajo={handleUpdateTrabajo}
      onDeleteTrabajo={handleDeleteClick}
      deleteConfirmOpen={deleteConfirmOpen}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  );
};

export default OrdenTrabajosSection;
