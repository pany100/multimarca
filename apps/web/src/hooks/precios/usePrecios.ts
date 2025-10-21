import { useFetch } from "@/contexts/FetchContext";
import {
  PrecioDto,
  PrecioFinalReparacionesDto,
  PrecioFinalRepuestosDto,
} from "@/core/infrastructure/validation/schemas/precio.schema";

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

  const calculatePreciosFinalReparaciones = async (
    entidad: PrecioFinalReparacionesDto
  ) => {
    try {
      const response = await authFetch("/api/precios/final-reparaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entidad),
      });

      if (!response.ok) {
        throw new Error(
          `Error calculating final prices for reparaciones: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in calculatePreciosFinalReparaciones:", error);
      throw error;
    }
  };

  const calculatePreciosFinalRepuestos = async (
    entidad: PrecioFinalRepuestosDto
  ) => {
    try {
      const response = await authFetch("/api/precios/final-repuestos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entidad),
      });

      if (!response.ok) {
        throw new Error(
          `Error calculating final prices for repuestos: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in calculatePreciosFinalRepuestos:", error);
      throw error;
    }
  };

  const calculateTotalReparaciones = async (
    entidad: PrecioFinalReparacionesDto
  ) => {
    try {
      const response = await authFetch("/api/precios/total-reparaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entidad),
      });

      if (!response.ok) {
        throw new Error(
          `Error calculating total for reparaciones: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in calculateTotalReparaciones:", error);
      throw error;
    }
  };

  const calculateTotalRepuestos = async (entidad: PrecioFinalRepuestosDto) => {
    try {
      const response = await authFetch("/api/precios/total-repuestos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entidad),
      });

      if (!response.ok) {
        throw new Error(
          `Error calculating total for repuestos: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in calculateTotalRepuestos:", error);
      throw error;
    }
  };

  return {
    calculatePrecios,
    calculatePreciosFinalReparaciones,
    calculatePreciosFinalRepuestos,
    calculateTotalReparaciones,
    calculateTotalRepuestos,
  };
}

export default usePrecios;
