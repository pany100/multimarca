import { useFetch } from "@/contexts/FetchContext";
import { useRouter } from "next/navigation";
import useNuevaVenta from "./useNuevaVenta";

type Props = {
  control: any;
  venta: {
    id: number;
  };
};

function useEditVenta({ control, venta }: Props) {
  const { authFetch } = useFetch();
  const router = useRouter();

  const { snackbar, setSnackbar, manoDeObra, totalOrdenReparacion } =
    useNuevaVenta({ control });

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch(`/api/ventas/${venta.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Venta actualizada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ventas");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al actualizar la venta",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de actualización: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };

  return {
    snackbar,
    setSnackbar,
    manoDeObra,
    totalOrdenReparacion,
    onSubmit,
  };
}

export default useEditVenta;
