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

function useNuevaVenta({ control }: Props) {
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
  const porcentajeRecargo =
    useWatch({ control, name: "porcentajeRecargo" }) || 0;
  const manoDeObra = calcularManoDeObra(trabajosRealizados ?? []);
  const totalOrdenReparacion = calcularTotalOrdenReparacion({
    repuestosUsados: repuestosUsados ?? [],
    reparacionesDeTercero: reparacionesTerceros ?? [],
    trabajosRealizados: trabajosRealizados ?? [],
    descuento,
    incremento: incremento || 0,
    porcentajeRecargo: porcentajeRecargo || 0,
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Venta creada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ventas");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la venta",
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
    onSubmit,
    snackbar,
    setSnackbar,
    manoDeObra,
    totalOrdenReparacion,
  };
}

export default useNuevaVenta;
