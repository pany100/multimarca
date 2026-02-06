import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import CertificadoEstudioForm from "../CertificadoEstudioForm";
import useCertificadoEstudioPersistence from "../hooks/useCertificadoEstudioPersistence";
import { schema } from "./NewCertificadoEstudioForm";

type Props = {
  id: string;
};

function EditCertificadoEstudioForm({ id }: Props) {
  const { fetchCertificadoEstudio, updateCertificadoEstudio } =
    useCertificadoEstudioPersistence();
  const [certificado, setCertificado] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  type FormData = yup.InferType<typeof schema>;
  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: "",
      fecha: null,
      descripcion: "",
      ruta: null,
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCertificadoEstudio(parseInt(id));
        setCertificado(data);
      } catch {
        setSnackbar({
          message: "Error al cargar el certificado",
          severity: "error",
          open: true,
        });
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (certificado) {
      methods.reset({
        nombre: certificado.nombre ?? "",
        fecha: certificado.fecha
          ? new Date(certificado.fecha).toISOString().split("T")[0]
          : null,
        descripcion: certificado.descripcion ?? "",
        ruta: certificado.ruta ?? null,
      });
    }
  }, [certificado, methods]);

  const onSubmit = async (data: any) => {
    if (!certificado) return;
    try {
      await updateCertificadoEstudio(parseInt(id), {
        nombre: data.nombre || null,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        descripcion: data.descripcion || null,
        ruta: data.ruta || null,
      });
      setSnackbar({
        message: "Certificado actualizado correctamente",
        severity: "success",
        open: true,
      });
      router.push(`/dashboard/mecanicos/${certificado.empleadoId}/ver`);
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al actualizar el certificado",
        severity: "error",
        open: true,
      });
    }
  };

  if (!certificado) {
    return null;
  }

  return (
    <CertificadoEstudioForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${certificado.empleadoId}/ver`)
      }
      isEdit
    />
  );
}

export default EditCertificadoEstudioForm;
