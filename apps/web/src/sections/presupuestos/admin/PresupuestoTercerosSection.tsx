import TercerosSection from "@/sections/ordenes-reparacion/admin/TercerosSection";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import { useTercerosPresupuestoManager } from "./hooks/useTercerosPresupuestoManager";

const PresupuestoTercerosSection = () => {
  const { presupuesto } = usePresupuestoRequired();
  const {
    loading,
    handleAddTercero,
    handleUpdateTercero,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTercerosPresupuestoManager();

  return (
    <TercerosSection
      terceros={presupuesto?.reparacionesDeTercero || []}
      porcentajeRecargo={presupuesto?.porcentajeRecargo}
      loading={loading}
      onAddTercero={handleAddTercero}
      onUpdateTercero={handleUpdateTercero}
      onDeleteTercero={handleDeleteClick}
      deleteConfirmOpen={deleteConfirmOpen}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  );
};

export default PresupuestoTercerosSection;
