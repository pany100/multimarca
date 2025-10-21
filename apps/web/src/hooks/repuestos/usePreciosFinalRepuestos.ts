import { useFetch } from "@/contexts/FetchContext";

interface RepuestoUsado {
  id?: number;
  stockId?: number;
  precioVenta?: number;
  unidadesConsumidas?: number;
  stock?: {
    id: number;
    nombre: string;
    precioVenta: number;
  };
}

interface RepuestoConPrecioFinal extends RepuestoUsado {
  precioConRecargo: number;
}

interface RequestData {
  repuestosUsados: RepuestoUsado[];
}

interface ResponseData {
  repuestosUsados: RepuestoConPrecioFinal[];
}

function usePreciosFinalRepuestos() {
  const { authFetch } = useFetch();

  const calculatePreciosFinal = async (data: RequestData): Promise<ResponseData> => {
    try {
      const response = await authFetch("/api/precios-final-repuestos", {
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

export default usePreciosFinalRepuestos;
