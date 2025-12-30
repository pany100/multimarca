import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useRouter } from "next/navigation";
import { useRefreshTable } from "../../contexts/RefreshTableContext";
import { useCreateDraftOrden } from "./useCreateDraftOrden";

interface NuevaOrdenFormData {
  autoId: number;
  kilometros?: number | null;
  observacionesCliente: string;
}

interface UseNuevaOrdenHandlersProps {
  onClose: () => void;
}

export const useNuevaOrdenHandlers = ({
  onClose,
}: UseNuevaOrdenHandlersProps) => {
  const { createDraftOrden, loading } = useCreateDraftOrden();
  const { setSnackbar } = useSnackbarContext();
  const { refreshTable } = useRefreshTable();
  const router = useRouter();

  const handleSubmit = async (data: NuevaOrdenFormData) => {
    try {
      const result = await createDraftOrden({
        autoId: data.autoId,
        kilometros: data.kilometros,
        observacionesCliente: data.observacionesCliente,
      });

      setSnackbar({
        message: "Orden creada exitosamente",
        severity: "success",
        open: true,
      });

      refreshTable();
      onClose();

      // Opcional: redirigir a la página de edición
      // router.push(`/dashboard/ordenes-reparacion/${result.id}/editar`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear la orden",
        severity: "error",
        open: true,
      });
    }
  };

  return {
    handleSubmit,
    loading,
  };
};
