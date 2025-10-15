import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useHoraExtraPersistence from "../hooks/useHoraExtraPersistence";
import HoraExtraForm from "../HoraExtraForm";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  horasTotales: yup
    .number()
    .positive("Las horas totales deben ser un número positivo")
    .required("Las horas totales son requeridas"),
  motivo: yup.string().nullable(),
});

interface Props {
  empleadoId: string;
}

function NewHoraExtraForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      horasTotales: 1, // Default hours
    },
  });

  const { createHoraExtra } = useHoraExtraPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      const horaExtraData = {
        ...data,
        empleadoId: parseInt(empleadoId),
      };

      await createHoraExtra(horaExtraData);
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear la hora extra: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <HoraExtraForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewHoraExtraForm;
