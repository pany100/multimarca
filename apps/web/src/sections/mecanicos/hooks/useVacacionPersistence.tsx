import { useState } from "react";

const useVacacionPersistence = () => {
  const [loading, setLoading] = useState(false);

  const createVacacion = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/ausencias-acordadas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear las vacaciones");
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteVacacion = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ausencias-acordadas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al eliminar las vacaciones"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateVacacion = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ausencias-acordadas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar las vacaciones"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchVacacion = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ausencias-acordadas/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Error al obtener las vacaciones");
      }
    } catch (error) {
      console.error("Error al obtener las vacaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createVacacion,
    deleteVacacion,
    updateVacacion,
    fetchVacacion,
    loading,
  };
};

export default useVacacionPersistence;
