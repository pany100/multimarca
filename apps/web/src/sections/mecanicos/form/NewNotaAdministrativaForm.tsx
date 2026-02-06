import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useNotaAdministrativaPersistence from "../hooks/useNotaAdministrativaPersistence";
import NotaAdministrativaForm from "../NotaAdministrativaForm";

export const schema = yup.object({
  fecha: yup.date().nullable(),
  titulo: yup.string().required("El título es requerido").max(255),
  descripcion: yup.string().nullable(),
});

interface Props {
  empleadoId: string;
}

function NewNotaAdministrativaForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: null,
      titulo: "",
      descripcion: "",
    },
  });

  const { createNotaAdministrativa } = useNotaAdministrativaPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      await createNotaAdministrativa({
        empleadoId: parseInt(empleadoId),
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        titulo: data.titulo,
        descripcion: data.descripcion || null,
      });
      setSnackbar({
        message: "Nota administrativa creada correctamente",
        severity: "success",
        open: true,
      });
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al crear la nota",
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <NotaAdministrativaForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewNotaAdministrativaForm;
