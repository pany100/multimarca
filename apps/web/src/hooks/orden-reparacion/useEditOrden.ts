import { useFetch } from "@/contexts/FetchContext";
import { useRouter } from "next/navigation";
import useNuevaOrden from "./useNuevaOrden";

type Props = {
  control: any;
  ordenReparacion: {
    id: number;
  };
  selectedFile?: File | null;
};

function useEditOrden({ control, ordenReparacion, selectedFile }: Props) {
  const { authFetch } = useFetch();
  const router = useRouter();

  const { snackbar, setSnackbar, manoDeObra, totalOrdenReparacion } =
    useNuevaOrden({ control });

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      if (selectedFile) {
        formData.append("pdfPath", selectedFile);
      }
      const response = await authFetch(
        `/api/orden-reparacion/${ordenReparacion.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Orden de reparación actualizada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ordenes-reparacion");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message:
            errorData.error || "Error al actualizar la orden de reparación",
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

export default useEditOrden;
