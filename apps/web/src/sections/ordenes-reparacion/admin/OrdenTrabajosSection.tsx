import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { Box } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";
import DescuentoManoDeObraSection from "./DescuentoManoDeObraSection";
import { useTrabajosManager } from "./hooks/useTrabajosManager";
import TrabajosSection from "./TrabajosSection";

const OrdenTrabajosSection = () => {
  const { orden, setOrden } = useOrden();
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();
  const {
    loading,
    handleAddTrabajo,
    handleUpdateTrabajo,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTrabajosManager();

  const handleDescuentoSave = async (value: number) => {
    const response = await authFetch(`/api/orden-reparacion/v2/${orden.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descuentoParaManoDeObra: value }),
    });
    if (response.ok) {
      const updated = await response.json();
      setOrden(updated);
      setSnackbar({
        open: true,
        message: "Descuento de mano de obra actualizado",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Error al actualizar el descuento",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TrabajosSection
        trabajos={orden?.trabajosRealizados || []}
        totalManoDeObra={orden?.totalManoDeObra || 0}
        loading={loading}
        onAddTrabajo={handleAddTrabajo}
        onUpdateTrabajo={handleUpdateTrabajo}
        onDeleteTrabajo={handleDeleteClick}
        deleteConfirmOpen={deleteConfirmOpen}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={handleDeleteCancel}
      />
      <DescuentoManoDeObraSection
        descuentoParaManoDeObra={Number(orden?.descuentoParaManoDeObra ?? 0)}
        totalManoDeObraSinIva={
          (orden?.trabajosRealizados || []).reduce(
            (sum: number, t: { precioUnitario: number }) =>
              sum + Number(t.precioUnitario),
            0,
          )
        }
        onSave={handleDescuentoSave}
      />
    </Box>
  );
};

export default OrdenTrabajosSection;
