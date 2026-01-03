import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

type ControlEnReparacion = {
  controlMecanicoId: number;
  valor: string;
};

export const useUpdateControles = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateControles = async (
    ordenId: number,
    controles: ControlEnReparacion[]
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
      return ordenActualizada;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateControles, loading, error };
};
