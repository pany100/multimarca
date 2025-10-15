import { useState } from "react";

const usePremioPersistence = () => {
  const [loading, setLoading] = useState(false);

  const createPremio = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/premios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el premio");
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePremio = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/premios/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al eliminar el premio"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePremio = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/premios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar el premio"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPremio = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/premios/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Error al obtener el premio");
      }
    } catch (error) {
      console.error("Error al obtener el premio:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createPremio,
    deletePremio,
    updatePremio,
    fetchPremio,
    loading,
  };
};

export default usePremioPersistence;
