import { useState } from "react";

const useApercibimientoPersistence = () => {
  const [loading, setLoading] = useState(false);

  const createApercibimiento = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/apercibimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el apercibimiento");
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteApercibimiento = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/apercibimientos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al eliminar el apercibimiento"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateApercibimiento = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/apercibimientos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar el apercibimiento"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchApercibimiento = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/apercibimientos/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Error al obtener el apercibimiento");
      }
    } catch (error) {
      console.error("Error al obtener el apercibimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createApercibimiento,
    deleteApercibimiento,
    updateApercibimiento,
    fetchApercibimiento,
    loading,
  };
};

export default useApercibimientoPersistence;
