import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useSueldoPersistence from "../hooks/useSueldoPersistence";
import SueldoForm from "../SueldoForm";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup.number().required("El monto es requerido").positive("El monto debe ser mayor a 0"),
  descripcion: yup.string().nullable(),
});

interface Props {
  empleadoId: string;
}

function NewSueldoForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: null,
      monto: "",
      descripcion: "",
    },
  });

  const { createSueldo } = useSueldoPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      await createSueldo({
        empleadoId: parseInt(empleadoId),
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        monto: Number(data.monto),
        descripcion: data.descripcion || null,
      });
      setSnackbar({
        message: "Sueldo creado correctamente",
        severity: "success",
        open: true,
      });
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al crear el sueldo",
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <SueldoForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewSueldoForm;
