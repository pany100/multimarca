import { useState } from "react";

const useHoraExtraPersistence = () => {
  const [loading, setLoading] = useState(false);

  const createHoraExtra = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/horas-extras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la hora extra");
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteHoraExtra = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/horas-extras/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al eliminar la hora extra"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHoraExtra = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/horas-extras/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la hora extra"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchHoraExtra = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/horas-extras/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Error al obtener la hora extra");
      }
    } catch (error) {
      console.error("Error al obtener la hora extra:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createHoraExtra,
    deleteHoraExtra,
    updateHoraExtra,
    fetchHoraExtra,
    loading,
  };
};

export default useHoraExtraPersistence;
