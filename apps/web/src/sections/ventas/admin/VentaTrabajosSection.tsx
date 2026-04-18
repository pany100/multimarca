import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import DescuentoManoDeObraSection from "@/sections/ordenes-reparacion/admin/DescuentoManoDeObraSection";
import TrabajosSection from "@/sections/ordenes-reparacion/admin/TrabajosSection";
import { Box } from "@mui/material";
import { useVentaRequired } from "./contexts/VentaContext";
import { useTrabajosVentaManager } from "./hooks/useTrabajosVentaManager";

const VentaTrabajosSection = () => {
  const { venta, setVenta } = useVentaRequired();
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
  } = useTrabajosVentaManager();

  const handleDescuentoSave = async (value: number) => {
    const response = await authFetch(`/api/ventas/${venta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descuentoParaManoDeObra: value }),
    });
    if (response.ok) {
      const updated = await response.json();
      setVenta(updated);
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
      <DescuentoManoDeObraSection
        descuentoParaManoDeObra={Number(venta?.descuentoParaManoDeObra ?? 0)}
        totalManoDeObraSinIva={
          (venta?.trabajosRealizados || []).reduce(
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

export default VentaTrabajosSection;
