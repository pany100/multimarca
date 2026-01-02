import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

interface PreviousReparation {
  id: number;
  fechaCreacion: string;
  fechaSalidaReparacion: string;
  observacionesSalida: string;
  kilometros: number;
}

export const usePreviousReparations = (autoId?: number) => {
  const { authFetch } = useFetch();
  const [reparacionesAnteriores, setReparacionesAnteriores] = useState<
    PreviousReparation[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReparacionesAnteriores = async () => {
      if (!autoId) {
        setReparacionesAnteriores([]);
        return;
      }

      setLoading(true);
      try {
        const response = await authFetch(
          `/api/autos/${autoId}/reparaciones-anteriores`
        );
        const data = await response.json();
        setReparacionesAnteriores(data);
      } catch (error) {
        console.error("Error al obtener reparaciones anteriores:", error);
        setReparacionesAnteriores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReparacionesAnteriores();
  }, [autoId, authFetch]);

  return {
    reparacionesAnteriores,
    loading,
  };
};
