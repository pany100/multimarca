import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useVacacionPersistence from "../hooks/useVacacionPersistence";
import VacacionForm from "../VacacionForm";
import { schema } from "./NewVacacionForm";

type Props = {
  id: string;
};

function EditVacationForm({ id }: Props) {
  const { fetchVacacion, updateVacacion } = useVacacionPersistence();
  const [vacacion, setVacacion] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  useEffect(() => {
    const fetchVacacionData = async () => {
      try {
        const data = await fetchVacacion(parseInt(id));
        setVacacion(data);
      } catch (error) {
        setSnackbar({
          message: "Error al obtener la vacacion: " + error,
          severity: "error",
          open: true,
        });
      }
    };
    fetchVacacionData();
  }, [id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...vacacion,
    },
  });

  useEffect(() => {
    if (vacacion) {
      methods.reset(vacacion);
    }
  }, [vacacion]);

  const onSubmit = async (data: any) => {
    try {
      await updateVacacion(parseInt(id), data);
      router.push(`/dashboard/mecanicos/${vacacion.empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar la vacacion: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <VacacionForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${vacacion.empleadoId}/ver`)
      }
    />
  );
}

export default EditVacationForm;
