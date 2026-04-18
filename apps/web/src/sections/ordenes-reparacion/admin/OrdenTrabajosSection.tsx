import { useFetch } from "@/contexts/FetchContext";
import { useOrden } from "./contexts/OrdenContext";
import { useTrabajosManager } from "./hooks/useTrabajosManager";
import TrabajosSection from "./TrabajosSection";

const OrdenTrabajosSection = () => {
  const { orden, setOrden } = useOrden();
  const { authFetch } = useFetch();
  const {
    loading,
    handleAddTrabajo,
    handleUpdateTrabajo,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTrabajosManager();

  const handleDescuentoChange = async (value: number) => {
    const response = await authFetch(`/api/orden-reparacion/v2/${orden.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descuentoParaManoDeObra: value }),
    });
    if (response.ok) {
      const updated = await response.json();
      setOrden(updated);
    }
  };

  return (
    <TrabajosSection
      trabajos={orden?.trabajosRealizados || []}
      totalManoDeObra={orden?.totalManoDeObra || 0}
      descuentoParaManoDeObra={Number(orden?.descuentoParaManoDeObra ?? 0)}
      onDescuentoParaManoDeObraChange={handleDescuentoChange}
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
