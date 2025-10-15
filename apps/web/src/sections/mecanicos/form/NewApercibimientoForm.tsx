import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useApercibimientoPersistence from "../hooks/useApercibimientoPersistence";
import ApercibimientoForm from "../ApercibimientoForm";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  tipo: yup
    .string()
    .oneOf(["Verbal", "Leve", "Grave", "MuyGrave"])
    .required("El tipo es requerido"),
  motivo: yup.string().required("El motivo es requerido"),
});

interface Props {
  empleadoId: string;
}

function NewApercibimientoForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tipo: "Leve", // Default type
    },
  });

  const { createApercibimiento } = useApercibimientoPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      const apercibimientoData = {
        ...data,
        empleadoId: parseInt(empleadoId),
      };

      await createApercibimiento(apercibimientoData);
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear el apercibimiento: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <ApercibimientoForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewApercibimientoForm;
