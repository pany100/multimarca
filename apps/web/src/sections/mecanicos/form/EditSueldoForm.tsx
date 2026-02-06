import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useSueldoPersistence from "../hooks/useSueldoPersistence";
import SueldoForm from "../SueldoForm";
import { schema } from "./NewSueldoForm";

type Props = {
  id: string;
};

function EditSueldoForm({ id }: Props) {
  const { fetchSueldo, updateSueldo } = useSueldoPersistence();
  const [sueldo, setSueldo] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: null,
      monto: "",
      descripcion: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSueldo(parseInt(id));
        setSueldo(data);
      } catch {
        setSnackbar({
          message: "Error al cargar el sueldo",
          severity: "error",
          open: true,
        });
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (sueldo) {
      const montoNum = sueldo.monto != null ? Number(sueldo.monto) : "";
      methods.reset({
        fecha: sueldo.fecha
          ? new Date(sueldo.fecha).toISOString().split("T")[0]
          : null,
        monto: montoNum,
        descripcion: sueldo.descripcion ?? "",
      });
    }
  }, [sueldo, methods]);

  const onSubmit = async (data: any) => {
    if (!sueldo) return;
    try {
      await updateSueldo(parseInt(id), {
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        monto: Number(data.monto),
        descripcion: data.descripcion || null,
      });
      setSnackbar({
        message: "Sueldo actualizado correctamente",
        severity: "success",
        open: true,
      });
      router.push(`/dashboard/mecanicos/${sueldo.empleadoId}/ver`);
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al actualizar el sueldo",
        severity: "error",
        open: true,
      });
    }
  };

  if (!sueldo) {
    return null;
  }

  return (
    <SueldoForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${sueldo.empleadoId}/ver`)
      }
      isEdit
    />
  );
}

export default EditSueldoForm;
