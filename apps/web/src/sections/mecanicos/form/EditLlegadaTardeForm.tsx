import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useLlegadaTardePersistence from "../hooks/useLlegadaTardePersistence";
import LlegadaTardeForm from "../LlegadaTardeForm";
import { schema } from "./NewLlegadaTardeForm";

type Props = {
  id: string;
};

function EditLlegadaTardeForm({ id }: Props) {
  const { fetchLlegadaTarde, updateLlegadaTarde } =
    useLlegadaTardePersistence();
  const [llegadaTarde, setLlegadaTarde] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  useEffect(() => {
    const fetchLlegadaTardeData = async () => {
      try {
        const data = await fetchLlegadaTarde(parseInt(id));
        setLlegadaTarde(data);
      } catch (error) {
        setSnackbar({
          message: "Error al obtener la llegada tarde: " + error,
          severity: "error",
          open: true,
        });
      }
    };
    fetchLlegadaTardeData();
  }, [id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...llegadaTarde,
    },
  });

  useEffect(() => {
    if (llegadaTarde) {
      // Format the date for the form
      const formattedData = {
        ...llegadaTarde,
        fecha: llegadaTarde.fecha
          ? new Date(llegadaTarde.fecha).toISOString().split("T")[0]
          : "",
      };
      methods.reset(formattedData);
    }
  }, [llegadaTarde]);

  const onSubmit = async (data: any) => {
    try {
      await updateLlegadaTarde(parseInt(id), data);
      router.push(`/dashboard/mecanicos/${llegadaTarde.empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar la llegada tarde: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <LlegadaTardeForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${llegadaTarde?.empleadoId}/ver`)
      }
      isEdit={true}
    />
  );
}

export default EditLlegadaTardeForm;
