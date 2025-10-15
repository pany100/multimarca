import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import usePremioPersistence from "../hooks/usePremioPersistence";
import PremioForm from "../PremioForm";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  tipo: yup
    .string()
    .oneOf(["Reconocimiento", "Economico", "Productividad", "Especial"])
    .required("El tipo es requerido"),
  descripcion: yup.string().nullable(),
  monto: yup.number().positive("El monto debe ser positivo").nullable(),
});

interface Props {
  empleadoId: string;
}

function NewPremioForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tipo: "Reconocimiento", // Default type
    },
  });

  const { createPremio } = usePremioPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      const premioData = {
        ...data,
        empleadoId: parseInt(empleadoId),
        monto: data.monto ? parseFloat(data.monto) : null,
      };

      await createPremio(premioData);
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al crear el premio: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <PremioForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewPremioForm;
