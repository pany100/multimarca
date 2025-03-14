import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

function usePrevOrdenes() {
  const { control } = useFormContext();
  const { authFetch } = useFetch();
  const [reparacionesAnteriores, setReparacionesAnteriores] = useState([]);
  const autoId = useWatch({ control, name: "autoId" });
  const isFirstRun = useRef(true);

  useEffect(() => {
    const fetchReparacionesAnteriores = async () => {
      if (!isFirstRun.current) {
        setReparacionesAnteriores([]);
      }
      if (autoId) {
        try {
          const response = await authFetch(
            `/api/autos/${autoId}/reparaciones-anteriores`
          );
          const data = await response.json();
          setReparacionesAnteriores(data);
        } catch (error) {
          console.error("Error al obtener reparaciones anteriores:", error);
        }
      }
      isFirstRun.current = false;
    };

    fetchReparacionesAnteriores();
  }, [autoId, authFetch]);

  return { reparacionesAnteriores };
}

export default usePrevOrdenes;
