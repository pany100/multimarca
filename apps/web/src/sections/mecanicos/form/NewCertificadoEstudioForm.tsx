import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useCertificadoEstudioPersistence from "../hooks/useCertificadoEstudioPersistence";
import CertificadoEstudioForm from "../CertificadoEstudioForm";

export const schema = yup.object({
  nombre: yup.string().nullable(),
  fecha: yup.date().nullable(),
  descripcion: yup.string().nullable(),
  ruta: yup.string().nullable(),
});

interface Props {
  empleadoId: string;
}

function NewCertificadoEstudioForm({ empleadoId }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: "",
      fecha: null,
      descripcion: "",
      ruta: null,
    },
  });

  const { createCertificadoEstudio } = useCertificadoEstudioPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      await createCertificadoEstudio({
        empleadoId: parseInt(empleadoId),
        nombre: data.nombre || null,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        descripcion: data.descripcion || null,
        ruta: data.ruta || null,
      });
      setSnackbar({
        message: "Certificado de estudio creado correctamente",
        severity: "success",
        open: true,
      });
      router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al crear el certificado",
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <CertificadoEstudioForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleadoId}/ver`)}
    />
  );
}

export default NewCertificadoEstudioForm;
