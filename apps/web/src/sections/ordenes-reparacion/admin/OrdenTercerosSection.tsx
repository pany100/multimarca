import TercerosSection from "./TercerosSection";
import { useOrden } from "./contexts/OrdenContext";
import { useTercerosManager } from "./hooks/useTercerosManager";

const OrdenTercerosSection = () => {
  const { orden } = useOrden();
  const {
    loading,
    handleAddTercero,
    handleUpdateTercero,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTercerosManager();

  return (
    <TercerosSection
      terceros={orden?.reparacionesDeTercero || []}
      porcentajeRecargo={orden?.porcentajeRecargo}
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

export default OrdenTercerosSection;
