import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useRouter } from "next/navigation";

function useBorradorForm(id: number) {
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const endpoint = data.esBorrador
        ? `/api/borradores/${id}`
        : "/api/orden-reparacion";
      const method = data.esBorrador ? "PUT" : "POST";

      const response = await authFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        if (!data.esBorrador) {
          // Si estamos creando un presupuesto, borramos el borrador
          await authFetch(`/api/borradores/${id}`, {
            method: "DELETE",
          });
        }

        setSnackbar({
          open: true,
          message: data.esBorrador
            ? "Borrador actualizado con éxito"
            : "Presupuesto creado con éxito",
          severity: "success",
        });

        if (data.esBorrador) {
          router.push("/dashboard/presupuestos");
        } else {
          router.back();
        }
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al procesar la solicitud",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };
  return { onSubmit };
}

export default useBorradorForm;
