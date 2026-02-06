import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

const useCertificadoEstudioPersistence = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);

  const createCertificadoEstudio = async (data: {
    empleadoId: number;
    nombre?: string | null;
    ruta?: string | null;
    fecha?: Date;
    descripcion?: string | null;
  }) => {
    setLoading(true);
    try {
      const response = await authFetch("/api/certificados-estudio", {
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
          errorData.error || errorData.message || "Error al crear el certificado"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCertificadoEstudio = async (
    id: number,
    data: {
      nombre?: string | null;
      ruta?: string | null;
      fecha?: Date;
      descripcion?: string | null;
    }
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/certificados-estudio/${id}`, {
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
            "Error al actualizar el certificado"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificadoEstudio = async (id: number) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/certificados-estudio/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al eliminar el certificado"
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificadoEstudio = async (id: number) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/certificados-estudio/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error("Error al obtener el certificado");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCertificadoEstudio,
    updateCertificadoEstudio,
    deleteCertificadoEstudio,
    fetchCertificadoEstudio,
    loading,
  };
};

export default useCertificadoEstudioPersistence;
