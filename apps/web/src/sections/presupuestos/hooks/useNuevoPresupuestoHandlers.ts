import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useRouter } from "next/navigation";
import { useCreateDraftPresupuesto } from "./useCreateDraftPresupuesto";

interface NuevoPresupuestoFormData {
  autoId?: number | null;
  informacionAuto?: string;
  informacionCliente?: string;
  cedulaFilePath?: string | null;
  observacionesCliente: string;
}

interface UseNuevoPresupuestoHandlersProps {
  onClose: () => void;
  refreshTable?: () => void;
}

export const useNuevoPresupuestoHandlers = ({
  onClose,
  refreshTable,
}: UseNuevoPresupuestoHandlersProps) => {
  const { createDraftPresupuesto, loading } = useCreateDraftPresupuesto();
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  const handleSubmit = async (data: NuevoPresupuestoFormData) => {
    try {
      const result = await createDraftPresupuesto({
        autoId: data.autoId,
        informacionAuto: data.informacionAuto,
        informacionCliente: data.informacionCliente,
        cedulaFilePath: data.cedulaFilePath,
        observacionesCliente: data.observacionesCliente,
      });

      setSnackbar({
        message: "Presupuesto creado exitosamente",
        severity: "success",
        open: true,
      });

      if (refreshTable) {
        refreshTable();
      }
      onClose();
    } catch (error) {
      setSnackbar({
        message: "Error al crear el presupuesto",
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
