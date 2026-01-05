import TrabajosSection from "@/sections/ordenes-reparacion/admin/TrabajosSection";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import { useTrabajosPresupuestoManager } from "./hooks/useTrabajosPresupuestoManager";

const PresupuestoTrabajosSection = () => {
  const { presupuesto } = usePresupuestoRequired();
  const {
    loading,
    handleAddTrabajo,
    handleUpdateTrabajo,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTrabajosPresupuestoManager();

  return (
    <TrabajosSection
      trabajos={presupuesto?.trabajosRealizados || []}
      totalManoDeObra={presupuesto?.totalManoDeObra || 0}
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

export default PresupuestoTrabajosSection;
