import { useFetch } from "@/contexts/FetchContext";
import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { useState } from "react";

export const useUpdateControles = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateControles = async (
    ordenId: number,
    controles: ControlMecanico[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const controlesParaEnviar = controles.map((control) => ({
        id: control.id,
        valor: control.valor,
      }));

      const response = await authFetch(`/api/orden-reparacion/v2/${ordenId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          controlesEnReparacion: controlesParaEnviar,
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
