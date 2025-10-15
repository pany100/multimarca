import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useVacacionPersistence from "../hooks/useVacacionPersistence";
import LicenciaForm from "../LicenciaForm";
import { schema } from "./NewLicenciaForm";

type Props = {
  id: string;
};

function EditLicenciaForm({ id }: Props) {
  const { fetchVacacion, updateVacacion } = useVacacionPersistence();
  const [licencia, setLicencia] = useState<any>(null);
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  useEffect(() => {
    const fetchLicenciaData = async () => {
      try {
        const data = await fetchVacacion(parseInt(id));
        setLicencia(data);
      } catch (error) {
        setSnackbar({
          message: "Error al obtener la licencia: " + error,
          severity: "error",
          open: true,
        });
      }
    };
    fetchLicenciaData();
  }, [id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...licencia,
    },
  });

  useEffect(() => {
    if (licencia) {
      // Convert boolean esGoceSueldo to string for the form
      const formData = {
        ...licencia,
        esGoceSueldo: licencia.esGoceSueldo ? "Si" : "No",
      };
      methods.reset(formData);
    }
  }, [licencia]);

  const onSubmit = async (data: any) => {
    try {
      // Convert esGoceSueldo from string to boolean
      const licenciaData = {
        ...data,
        esGoceSueldo: data.esGoceSueldo === "Si",
      };

      await updateVacacion(parseInt(id), licenciaData);
      router.push(`/dashboard/mecanicos/${licencia.empleadoId}/ver`);
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar la licencia: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <LicenciaForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() =>
        router.push(`/dashboard/mecanicos/${licencia?.empleadoId}/ver`)
      }
    />
  );
}

export default EditLicenciaForm;
