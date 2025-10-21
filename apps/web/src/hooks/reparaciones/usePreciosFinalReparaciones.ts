import { useFetch } from "@/contexts/FetchContext";

interface ReparacionTercero {
  id?: number;
  nombre: string;
  precioVenta: number;
  precioCompra?: number;
  proveedor?: {
    id?: number;
    name?: string;
  };
  recibo?: string;
}

interface ReparacionConPrecioFinal extends ReparacionTercero {
  precioConRecargo: number;
}

interface RequestData {
  reparacionesTerceros: ReparacionTercero[];
  porcentajeRecargo: number;
}

interface ResponseData {
  reparacionesTerceros: ReparacionConPrecioFinal[];
  porcentajeRecargo: number;
}

function usePreciosFinalReparaciones() {
  const { authFetch } = useFetch();

  const calculatePreciosFinal = async (data: RequestData): Promise<ResponseData> => {
    try {
      const response = await authFetch("/api/precios-final-reparaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error calculating final prices: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in calculatePreciosFinal:", error);
      throw error;
    }
  };

  return {
    calculatePreciosFinal,
  };
}

export default usePreciosFinalReparaciones;
