import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

const useNotaAdministrativaPersistence = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);

  const createNotaAdministrativa = async (data: {
    empleadoId: number;
    fecha?: Date;
    titulo: string;
    descripcion?: string | null;
  }) => {
    setLoading(true);
    try {
      const response = await authFetch("/api/notas-administrativas", {
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
          errorData.error ||
            errorData.message ||
            "Error al crear la nota administrativa"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateNotaAdministrativa = async (
    id: number,
    data: {
      fecha?: Date;
      titulo?: string;
      descripcion?: string | null;
    }
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/notas-administrativas/${id}`, {
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
            "Error al actualizar la nota administrativa"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotaAdministrativa = async (id: number) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/notas-administrativas/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al eliminar la nota administrativa"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotaAdministrativa = async (id: number) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/notas-administrativas/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error("Error al obtener la nota administrativa");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createNotaAdministrativa,
    updateNotaAdministrativa,
    deleteNotaAdministrativa,
    fetchNotaAdministrativa,
    loading,
  };
};

export default useNotaAdministrativaPersistence;
