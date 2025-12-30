import { useState } from "react";

export const useCerrarOrdenHandler = (ordenId: number) => {
  const [loading, setLoading] = useState(false);

  const handleCerrarOrden = async () => {
    setLoading(true);
    try {
      // TODO: Implementar la lógica para cerrar la orden
      console.log("Cerrar orden:", ordenId);
      // Aquí irá la llamada a la API para cerrar la orden
    } catch (error) {
      console.error("Error al cerrar orden:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleCerrarOrden,
  };
};
