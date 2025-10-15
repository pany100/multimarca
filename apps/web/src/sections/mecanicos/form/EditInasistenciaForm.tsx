import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useInasistenciaPersistence from "../hooks/useInasistenciaPersistence";
import InasistenciaForm from "../InasistenciaForm";
import { schema } from "./NewInasistenciaForm";

type Props = {
  id: string;
};

function EditInasistenciaForm({ id }: Props) {
  const { fetchInasistencia, updateInasistencia } =
    useInasistenciaPersistence();
  const [inasistencia, setInasistencia] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  useEffect(() => {
    const fetchInasistenciaData = async () => {
      try {
        const data = await fetchInasistencia(parseInt(id));
        setInasistencia(data);
      } catch (error) {
        setSnackbar({
          message: "Error al obtener la inasistencia: " + error,
          severity: "error",
          open: true,
        });
      }
    };
    fetchInasistenciaData();
  }, [id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...inasistencia,
    },
  });

  useEffect(() => {
    if (inasistencia) {
      // Format the date for the form
      const formattedData = {
        ...inasistencia,
        fecha: inasistencia.fecha
          ? new Date(inasistencia.fecha).toISOString().split("T")[0]
          : "",
      };
      methods.reset(formattedData);
    }
  }, [inasistencia]);

  const onSubmit = async (data: any) => {
    try {
      await updateInasistencia(parseInt(id), data);
      router.push(`/dashboard/mecanicos/${inasistencia.empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar la inasistencia: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <InasistenciaForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${inasistencia?.empleadoId}/ver`)
      }
      isEdit={true}
    />
  );
}

export default EditInasistenciaForm;
