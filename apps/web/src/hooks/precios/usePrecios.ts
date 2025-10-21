import { useFetch } from "@/contexts/FetchContext";
import { PrecioDto } from "@/core/infrastructure/validation/schemas/precio.schema";

function usePrecios() {
  const { authFetch } = useFetch();

  const calculatePrecios = async (entidad: PrecioDto) => {
    try {
      const response = await authFetch("/api/precios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entidad),
      });

      if (!response.ok) {
        throw new Error(`Error calculating prices: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in calculatePrecios:", error);
      throw error;
    }
  };

  return {
    calculatePrecios,
  };
}

export default usePrecios;
