import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Empleado } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import useEmpleadoPersistence from "../hooks/useEmpleadoPersistence";
import MecanicosForm from "../MecanicosForm";
import { schema } from "./NewMecanicoForm";

type Props = {
  empleado: Empleado;
};

function EditEmpleadoForm({ empleado }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: empleado.name,
      dni: empleado.dni,
      email: empleado.email,
      phone: empleado.phone,
      city: empleado.city,
      address: empleado.address,
      state: empleado.state,
      postal_code: empleado.postal_code,
      start_date: empleado.start_date ? new Date(empleado.start_date) : null,
      birthday: empleado.birthday ? new Date(empleado.birthday) : null,
      tipo: empleado.tipo,
      dniImagePath: empleado.dniImagePath,
    },
  });

  const { updateEmpleado } = useEmpleadoPersistence();
  const { setSnackbar } = useSnackbarContext();

  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await updateEmpleado({
        ...data,
        id: empleado.id,
      });
      router.push("/dashboard/mecanicos");
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar el mecanico: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <MecanicosForm
      methods={methods}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/dashboard/mecanicos/${empleado.id}/ver`)}
    />
  );
}

export default EditEmpleadoForm;
