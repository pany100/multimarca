import { useFetch } from "@/contexts/FetchContext";
import TrabajosSection from "@/sections/ordenes-reparacion/admin/TrabajosSection";
import { useVentaRequired } from "./contexts/VentaContext";
import { useTrabajosVentaManager } from "./hooks/useTrabajosVentaManager";

const VentaTrabajosSection = () => {
  const { venta, setVenta } = useVentaRequired();
  const { authFetch } = useFetch();
  const {
    loading,
    handleAddTrabajo,
    handleUpdateTrabajo,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTrabajosVentaManager();

  const handleDescuentoChange = async (value: number) => {
    const response = await authFetch(`/api/ventas/${venta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descuentoParaManoDeObra: value }),
    });
    if (response.ok) {
      const updated = await response.json();
      setVenta(updated);
    }
  };

  return (
    <TrabajosSection
      trabajos={venta?.trabajosRealizados || []}
      totalManoDeObra={venta?.totalManoDeObra || 0}
      descuentoParaManoDeObra={Number(venta?.descuentoParaManoDeObra ?? 0)}
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

export default VentaTrabajosSection;
