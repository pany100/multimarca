import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useVacacionPersistence from "../hooks/useVacacionPersistence";
import VacacionForm from "../VacacionForm";

export const schema = yup.object({
  fechaDesde: yup.date().required("La fecha desde es requerida"),
  fechaHasta: yup.date().required("La fecha hasta es requerida"),
  observaciones: yup.string().nullable(),
  estado: yup
    .string()
    .oneOf(["Pendiente", "Aprobada", "Rechazada", "Cancelada"])
    .required("El estado es requerido"),
  fechaAprobacion: yup.date().nullable(),
});
interface Props {
  empleadoId: string;
}

function NewVacacionForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      estado: "Pendiente", // Default state
    },
  });

  const { createVacacion } = useVacacionPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      // Add hardcoded values and empleadoId
      const vacacionData = {
        ...data,
        empleadoId: parseInt(empleadoId),
        esGoceSueldo: true,
        tipo: "Vacaciones",
      };

      await createVacacion(vacacionData);
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear las vacaciones: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <VacacionForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewVacacionForm;
