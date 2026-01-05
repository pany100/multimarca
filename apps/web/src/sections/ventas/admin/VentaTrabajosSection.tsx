import TrabajosSection from "@/sections/ordenes-reparacion/admin/TrabajosSection";
import { useVentaRequired } from "./contexts/VentaContext";
import { useTrabajosVentaManager } from "./hooks/useTrabajosVentaManager";

const VentaTrabajosSection = () => {
  const { venta } = useVentaRequired();
  const {
    loading,
    handleAddTrabajo,
    handleUpdateTrabajo,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTrabajosVentaManager();

  return (
    <TrabajosSection
      trabajos={venta?.trabajosRealizados || []}
      totalManoDeObra={venta?.totalManoDeObra || 0}
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

export default VentaTrabajosSection;
