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

  return {
    createVacacion,
    loading,
  };
};

export default useVacacionPersistence;
