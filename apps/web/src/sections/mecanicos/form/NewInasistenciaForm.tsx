import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useInasistenciaPersistence from "../hooks/useInasistenciaPersistence";
import InasistenciaForm from "../InasistenciaForm";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  motivo: yup.string().nullable(),
  tipo: yup
    .string()
    .oneOf(["Medica", "Personal", "SinAviso", "Otro"])
    .required("El tipo es requerido"),
  certificadoMedicoPath: yup.string().nullable(),
});

interface Props {
  empleadoId: string;
}

function NewInasistenciaForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tipo: "Medica", // Default type
    },
  });

  const { createInasistencia } = useInasistenciaPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      const inasistenciaData = {
        ...data,
        empleadoId: parseInt(empleadoId),
      };

      await createInasistencia(inasistenciaData);
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear la inasistencia: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <InasistenciaForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewInasistenciaForm;
