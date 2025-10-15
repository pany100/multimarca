import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useHoraExtraPersistence from "../hooks/useHoraExtraPersistence";
import HoraExtraForm from "../HoraExtraForm";
import { schema } from "./NewHoraExtraForm";

type Props = {
  id: string;
};

function EditHoraExtraForm({ id }: Props) {
  const { fetchHoraExtra, updateHoraExtra } = useHoraExtraPersistence();
  const [horaExtra, setHoraExtra] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  useEffect(() => {
    const fetchHoraExtraData = async () => {
      try {
        const data = await fetchHoraExtra(parseInt(id));
        setHoraExtra(data);
      } catch (error) {
        setSnackbar({
          message: "Error al obtener la hora extra: " + error,
          severity: "error",
          open: true,
        });
      }
    };
    fetchHoraExtraData();
  }, [id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...horaExtra,
    },
  });

  useEffect(() => {
    if (horaExtra) {
      // Format the date for the form
      const formattedData = {
        ...horaExtra,
        fecha: horaExtra.fecha
          ? new Date(horaExtra.fecha).toISOString().split("T")[0]
          : "",
        horasTotales: parseFloat(horaExtra.horasTotales) || 0,
      };
      methods.reset(formattedData);
    }
  }, [horaExtra]);

  const onSubmit = async (data: any) => {
    try {
      await updateHoraExtra(parseInt(id), data);
      router.push(`/dashboard/mecanicos/${horaExtra.empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar la hora extra: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <HoraExtraForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${horaExtra?.empleadoId}/ver`)
      }
      isEdit={true}
    />
  );
}

export default EditHoraExtraForm;
