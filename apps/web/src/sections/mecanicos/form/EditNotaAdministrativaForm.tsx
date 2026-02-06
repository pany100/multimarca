import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useNotaAdministrativaPersistence from "../hooks/useNotaAdministrativaPersistence";
import NotaAdministrativaForm from "../NotaAdministrativaForm";
import { schema } from "./NewNotaAdministrativaForm";

type Props = {
  id: string;
};

function EditNotaAdministrativaForm({ id }: Props) {
  const { fetchNotaAdministrativa, updateNotaAdministrativa } =
    useNotaAdministrativaPersistence();
  const [nota, setNota] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: null,
      titulo: "",
      descripcion: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotaAdministrativa(parseInt(id));
        setNota(data);
      } catch {
        setSnackbar({
          message: "Error al cargar la nota administrativa",
          severity: "error",
          open: true,
        });
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (nota) {
      methods.reset({
        fecha: nota.fecha
          ? new Date(nota.fecha).toISOString().split("T")[0]
          : null,
        titulo: nota.titulo ?? "",
        descripcion: nota.descripcion ?? "",
      });
    }
  }, [nota, methods]);

  const onSubmit = async (data: any) => {
    if (!nota) return;
    try {
      await updateNotaAdministrativa(parseInt(id), {
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        titulo: data.titulo,
        descripcion: data.descripcion || null,
      });
      setSnackbar({
        message: "Nota administrativa actualizada correctamente",
        severity: "success",
        open: true,
      });
      router.push(`/dashboard/mecanicos/${nota.empleadoId}/ver`);
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al actualizar la nota",
        severity: "error",
        open: true,
      });
    }
  };

  if (!nota) {
    return null;
  }

  return (
    <NotaAdministrativaForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${nota.empleadoId}/ver`)
      }
      isEdit
    />
  );
}

export default EditNotaAdministrativaForm;
