import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useRouter } from "next/navigation";
import { useCreateDraftVenta } from "./useCreateDraftVenta";

interface FormData {
  clienteId?: number | null;
  informacionCliente?: string;
  fecha: Date;
}

interface UseNuevaVentaV2HandlersProps {
  refreshTable: () => void;
  closeModal: () => void;
}

export const useNuevaVentaV2Handlers = ({
  refreshTable,
  closeModal,
}: UseNuevaVentaV2HandlersProps) => {
  const { createDraftVenta, loading } = useCreateDraftVenta();
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  const handleSubmit = async (data: FormData) => {
    try {
      const venta = await createDraftVenta(data);

      setSnackbar({
        open: true,
        message: "Venta creada exitosamente",
        severity: "success",
      });

      refreshTable();
      closeModal();

      // Redirect to edit page
      router.push(`/dashboard/ventas/${venta.id}/editar`);
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Error al crear la venta",
        severity: "error",
      });
    }
  };

  return {
    handleSubmit,
    loading,
  };
};
