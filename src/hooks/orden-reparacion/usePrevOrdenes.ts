import { useFetch } from "@/contexts/FetchContext";
import { useNuevaOrdenContext } from "@/contexts/NuevaOrdenContext";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

function usePrevOrdenes() {
  const { control, watch, setValue } = useFormContext();
  const { setSnackbar } = useNuevaOrdenContext();
  const { authFetch } = useFetch();
  const [reparacionesAnteriores, setReparacionesAnteriores] = useState([]);
  const autoId = useWatch({ control, name: "autoId" });
  const isFirstRun = useRef(true);

  const observaciones = JSON.parse(watch("observacionesEntrada") || "[]");

  const isObservationAlreadyAdded = (observation: string) => {
    return observaciones.includes(observation);
  };

  const handleAddPreviousObservation = (observation: string) => {
    if (!observaciones.includes(observation)) {
      setValue(
        "observacionesEntrada",
        JSON.stringify([...observaciones, observation])
      );
      setSnackbar({
        open: true,
        message: "Observación agregada correctamente",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Esta observación ya fue agregada",
        severity: "error",
      });
    }
  };

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

  return {
    reparacionesAnteriores,
    isObservationAlreadyAdded,
    handleAddPreviousObservation,
  };
}

export default usePrevOrdenes;
