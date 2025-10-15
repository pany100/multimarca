import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApercibimientoPersistence from "../hooks/useApercibimientoPersistence";
import ApercibimientoForm from "../ApercibimientoForm";
import { schema } from "./NewApercibimientoForm";

type Props = {
  id: string;
};

function EditApercibimientoForm({ id }: Props) {
  const { fetchApercibimiento, updateApercibimiento } =
    useApercibimientoPersistence();
  const [apercibimiento, setApercibimiento] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  useEffect(() => {
    const fetchApercibimientoData = async () => {
      try {
        const data = await fetchApercibimiento(parseInt(id));
        setApercibimiento(data);
      } catch (error) {
        setSnackbar({
          message: "Error al obtener el apercibimiento: " + error,
          severity: "error",
          open: true,
        });
      }
    };
    fetchApercibimientoData();
  }, [id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...apercibimiento,
    },
  });

  useEffect(() => {
    if (apercibimiento) {
      // Format the date for the form
      const formattedData = {
        ...apercibimiento,
        fecha: apercibimiento.fecha
          ? new Date(apercibimiento.fecha).toISOString().split("T")[0]
          : "",
      };
      methods.reset(formattedData);
    }
  }, [apercibimiento]);

  const onSubmit = async (data: any) => {
    try {
      await updateApercibimiento(parseInt(id), data);
      router.push(`/dashboard/mecanicos/${apercibimiento.empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar el apercibimiento: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <ApercibimientoForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${apercibimiento?.empleadoId}/ver`)
      }
      isEdit={true}
    />
  );
}

export default EditApercibimientoForm;
