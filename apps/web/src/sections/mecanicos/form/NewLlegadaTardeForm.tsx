import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useLlegadaTardePersistence from "../hooks/useLlegadaTardePersistence";
import LlegadaTardeForm from "../LlegadaTardeForm";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  minutosRetraso: yup
    .number()
    .positive("Los minutos de retraso deben ser un número positivo")
    .required("Los minutos de retraso son requeridos"),
  motivo: yup.string().nullable(),
  estado: yup
    .string()
    .oneOf(["Justificada", "Injustificada", "Pendiente"])
    .required("El estado es requerido"),
  certificadoPath: yup.string().nullable(),
});

interface Props {
  empleadoId: string;
}

function NewLlegadaTardeForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      estado: "Pendiente", // Default state
    },
  });

  const { createLlegadaTarde } = useLlegadaTardePersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      const llegadaTardeData = {
        ...data,
        empleadoId: parseInt(empleadoId),
      };

      await createLlegadaTarde(llegadaTardeData);
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear la llegada tarde: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <LlegadaTardeForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewLlegadaTardeForm;
