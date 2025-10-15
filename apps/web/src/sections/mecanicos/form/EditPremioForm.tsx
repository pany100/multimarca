import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import usePremioPersistence from "../hooks/usePremioPersistence";
import PremioForm from "../PremioForm";
import { schema } from "./NewPremioForm";

type Props = {
  id: string;
};

function EditPremioForm({ id }: Props) {
  const { fetchPremio, updatePremio } = usePremioPersistence();
  const [premio, setPremio] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  useEffect(() => {
    const fetchPremioData = async () => {
      try {
        const data = await fetchPremio(parseInt(id));
        setPremio(data);
      } catch (error) {
        setSnackbar({
          message: "Error al obtener el premio: " + error,
          severity: "error",
          open: true,
        });
      }
    };
    fetchPremioData();
  }, [id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...premio,
    },
  });

  useEffect(() => {
    if (premio) {
      // Format the data for the form
      const formattedData = {
        ...premio,
        fecha: premio.fecha
          ? new Date(premio.fecha).toISOString().split("T")[0]
          : "",
        monto: premio.monto ? parseFloat(premio.monto) : null,
      };
      methods.reset(formattedData);
    }
  }, [premio]);

  const onSubmit = async (data: any) => {
    try {
      const premioData = {
        ...data,
        monto: data.monto ? parseFloat(data.monto) : null,
      };
      
      await updatePremio(parseInt(id), premioData);
      router.push(`/dashboard/mecanicos/${premio.empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar el premio: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <PremioForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${premio?.empleadoId}/ver`)
      }
      isEdit={true}
    />
  );
}

export default EditPremioForm;
