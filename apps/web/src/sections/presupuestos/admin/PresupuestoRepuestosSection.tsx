import RepuestosSection from "@/sections/ordenes-reparacion/admin/RepuestosSection";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import { useRepuestosPresupuestoManager } from "./hooks/useRepuestosPresupuestoManager";

const PresupuestoRepuestosSection = () => {
  const { presupuesto } = usePresupuestoRequired();
  const {
    loading,
    handleAddRepuesto,
    handleUpdateRepuesto,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useRepuestosPresupuestoManager();

  return (
    <RepuestosSection
      repuestos={presupuesto?.repuestosUsados || []}
      totalRepuestos={presupuesto?.totalRepuestos || 0}
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

export default PresupuestoRepuestosSection;
