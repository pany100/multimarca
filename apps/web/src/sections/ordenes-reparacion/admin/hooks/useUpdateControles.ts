import { useFetch } from "@/contexts/FetchContext";
import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";

export const useUpdateControles = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setOrden } = useOrden();

  const updateControles = async (
    ordenId: number,
    controles: ControlMecanico[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/orden-reparacion/v2/${ordenId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          controlesEnReparacion: controles,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los controles");
      }

      const ordenActualizada = await response.json();
      setOrden(ordenActualizada);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateControles, loading, error };
};
