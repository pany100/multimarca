"use client";

import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useRouter } from "next/navigation";

function usePlantillaForm() {
  const { setSnackbar } = useSnackbarContext();
  const { authFetch } = useFetch();
  const router = useRouter();
  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/plantilla-presupuesto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Plantilla creada con éxito",
          severity: "success",
        });
        router.push("/dashboard/plantilla-presupuesto");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la plantilla",
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

  return { onSubmit };
}

export default usePlantillaForm;
