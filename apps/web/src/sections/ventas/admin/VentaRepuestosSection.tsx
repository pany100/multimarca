import RepuestosSection from "@/sections/ordenes-reparacion/admin/RepuestosSection";
import { useVentaRequired } from "./contexts/VentaContext";
import { useRepuestosVentaManager } from "./hooks/useRepuestosVentaManager";

const VentaRepuestosSection = () => {
  const { venta } = useVentaRequired();
  const {
    loading,
    handleAddRepuesto,
    handleUpdateRepuesto,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useRepuestosVentaManager();

  return (
    <RepuestosSection
      repuestos={venta?.repuestosUsados || []}
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

export default VentaRepuestosSection;
