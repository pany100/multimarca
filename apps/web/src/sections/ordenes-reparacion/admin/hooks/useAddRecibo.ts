import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useAddRecibo = () => {
  const [loading, setLoading] = useState(false);
  const { authFetch } = useFetch();

  const addRecibo = async (ordenId: number, reciboPath: string) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/orden-reparacion/v2/${ordenId}/recibos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reciboPath }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al agregar el recibo");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al agregar recibo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecibo = async (ordenId: number, reciboPath: string) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/orden-reparacion/v2/${ordenId}/recibos`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reciboPath }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el recibo");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al eliminar recibo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addRecibo,
    deleteRecibo,
    loading,
  };
};
