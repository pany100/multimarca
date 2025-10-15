import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useVacacionPersistence from "../hooks/useVacacionPersistence";
import LicenciaForm from "../LicenciaForm";

export const schema = yup.object({
  fechaDesde: yup.date().required("La fecha desde es requerida"),
  fechaHasta: yup.date().required("La fecha hasta es requerida"),
  observaciones: yup.string().nullable(),
  estado: yup
    .string()
    .oneOf(["Pendiente", "Aprobada", "Rechazada", "Cancelada"])
    .required("El estado es requerido"),
  fechaAprobacion: yup.date().nullable(),
  esGoceSueldo: yup
    .string()
    .oneOf(["Si", "No"])
    .required("El goce de sueldo es requerido"),
});

interface Props {
  empleadoId: string;
}

function NewLicenciaForm({ empleadoId }: Props) {
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
      // Convert esGoceSueldo from string to boolean
      const licenciaData = {
        ...data,
        empleadoId: parseInt(empleadoId),
        esGoceSueldo: data.esGoceSueldo === "Si",
        tipo: "Licencia",
      };

      await createVacacion(licenciaData);
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear la licencia: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <LicenciaForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewLicenciaForm;
