import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import {
  calcularManoDeObra,
  calcularTotalOrdenReparacion,
} from "@/utils/ordenHelper";
import { useRouter } from "next/navigation";
import { useWatch } from "react-hook-form";

type Props = {
  control: any;
};

function useNuevaOrden({ control }: Props) {
  const { authFetch } = useFetch();
  const router = useRouter();
  const { snackbar, setSnackbar } = useSnackbarContext();
  const repuestosUsados = useWatch({ control, name: "repuestosUsados" });
  const reparacionesTerceros = useWatch({
    control,
    name: "reparacionesDeTercero",
  });
  const trabajosRealizados = useWatch({ control, name: "trabajosRealizados" });
  const descuento = useWatch({ control, name: "descuento" }) || 0;
  const incremento = useWatch({ control, name: "incremento" }) || 0;
  const manoDeObra = calcularManoDeObra(trabajosRealizados ?? []);
  const totalOrdenReparacion = calcularTotalOrdenReparacion({
    repuestosUsados: repuestosUsados ?? [],
    reparacionesDeTercero: reparacionesTerceros ?? [],
    trabajosRealizados: trabajosRealizados ?? [],
    descuento,
    incremento,
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/orden-reparacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Orden de reparación creada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ordenes-reparacion");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la orden de reparación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de creación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };

  const presupuestoSubmit = async (data: any) => {
    try {
      const endpoint = "/api/presupuestos";
      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Presupuesto creado con éxito",
          severity: "success",
        });
        router.push("/dashboard/presupuestos");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear el presupuesto",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de creación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };

  const handlePresupuestoEdit = async (data: any) => {
    try {
      const response = await authFetch(`/api/presupuestos/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Presupuesto actualizado con éxito",
          severity: "success",
        });
        router.push("/dashboard/presupuestos");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al actualizar el presupuesto",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de creación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };

  return {
    presupuestoSubmit,
    onSubmit,
    handlePresupuestoEdit,
    snackbar,
    setSnackbar,
    manoDeObra,
    totalOrdenReparacion,
  };
}

export default useNuevaOrden;
