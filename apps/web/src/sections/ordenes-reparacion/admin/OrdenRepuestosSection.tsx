import { useOrden } from "./contexts/OrdenContext";
import { useRepuestosManager } from "./hooks/useRepuestosManager";
import RepuestosSection from "./RepuestosSection";

const OrdenRepuestosSection = () => {
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

  return (
    <RepuestosSection
      repuestos={orden?.repuestosUsados || []}
      totalRepuestos={orden?.totalRepuestos || 0}
      loading={loading}
      onAddRepuesto={handleAddRepuesto}
      onUpdateRepuesto={handleUpdateRepuesto}
      onDeleteRepuesto={handleDeleteClick}
      deleteConfirmOpen={deleteConfirmOpen}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  );
};

export default OrdenRepuestosSection;
