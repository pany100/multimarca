import { useState } from "react";

const useLlegadaTardePersistence = () => {
  const [loading, setLoading] = useState(false);

  const createLlegadaTarde = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/llegadas-tarde", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la llegada tarde");
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteLlegadaTarde = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/llegadas-tarde/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al eliminar la llegada tarde"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLlegadaTarde = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/llegadas-tarde/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la llegada tarde"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchLlegadaTarde = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/llegadas-tarde/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Error al obtener la llegada tarde");
      }
    } catch (error) {
      console.error("Error al obtener la llegada tarde:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createLlegadaTarde,
    deleteLlegadaTarde,
    updateLlegadaTarde,
    fetchLlegadaTarde,
    loading,
  };
};

export default useLlegadaTardePersistence;
