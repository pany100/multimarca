import TercerosSection from "@/sections/ordenes-reparacion/admin/TercerosSection";
import { useVentaRequired } from "./contexts/VentaContext";
import { useTercerosVentaManager } from "./hooks/useTercerosVentaManager";

const VentaTercerosSection = () => {
  const { venta } = useVentaRequired();
  const {
    loading,
    handleAddTercero,
    handleUpdateTercero,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTercerosVentaManager();
  return (
    <TercerosSection
      terceros={venta?.reparacionesDeTercero || []}
      porcentajeRecargo={venta?.porcentajeRecargo}
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

export default VentaTercerosSection;
