import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

const useSueldoPersistence = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);

  const createSueldo = async (data: {
    empleadoId: number;
    fecha?: Date;
    monto: number;
    descripcion?: string | null;
  }) => {
    setLoading(true);
    try {
      const response = await authFetch("/api/sueldos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          fecha: data.fecha?.toISOString?.() ?? undefined,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Error al crear el sueldo"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSueldo = async (
    id: number,
    data: {
      fecha?: Date;
      monto?: number;
      descripcion?: string | null;
    }
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/sueldos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          fecha: data.fecha?.toISOString?.() ?? undefined,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al actualizar el sueldo"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSueldo = async (id: number) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/sueldos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al eliminar el sueldo"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSueldo = async (id: number) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/sueldos/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error("Error al obtener el sueldo");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSueldo,
    updateSueldo,
    deleteSueldo,
    fetchSueldo,
    loading,
  };
};

export default useSueldoPersistence;
