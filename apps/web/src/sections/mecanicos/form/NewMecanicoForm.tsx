import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useEmpleadoPersistence from "../hooks/useEmpleadoPersistence";
import MecanicosForm from "../MecanicosForm";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  dni: yup
    .string()
    .matches(
      /^(\d{2}-\d{8}-\d|\d{11})$/,
      "El CUIT/CUIL debe tener formato 00-00000000-0 o solo números"
    )
    .nullable(),
  email: yup.string().email("El email es inválido").nullable(),
  phone: yup.string().nullable(),
  city: yup.string().nullable(),
  address: yup.string().nullable(),
  state: yup.string().nullable(),
  postal_code: yup.string().nullable(),
  start_date: yup.date().nullable(),
  birthday: yup.date().nullable(),
  tipo: yup.string().oneOf(["Mecanico", "Administrativo"]).nullable(),
  dniImagePath: yup.string().nullable(),
});

function NewMecanicoForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const { createEmpleado } = useEmpleadoPersistence();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();

  const onSubmit = async (data: any) => {
    try {
      await createEmpleado(data);
      router.push("/dashboard/mecanicos");
    } catch (error) {
      setSnackbar({
        message: "Error al crear el mecanico: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <MecanicosForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push("/dashboard/mecanicos")}
    />
  );
}

export default NewMecanicoForm;
