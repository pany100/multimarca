import { useState } from "react";

const useInasistenciaPersistence = () => {
  const [loading, setLoading] = useState(false);

  const createInasistencia = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/inasistencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la inasistencia");
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteInasistencia = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inasistencias/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al eliminar la inasistencia"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateInasistencia = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inasistencias/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la inasistencia"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchInasistencia = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inasistencias/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Error al obtener la inasistencia");
      }
    } catch (error) {
      console.error("Error al obtener la inasistencia:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createInasistencia,
    deleteInasistencia,
    updateInasistencia,
    fetchInasistencia,
    loading,
  };
};

export default useInasistenciaPersistence;
