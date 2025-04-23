import { useFetch } from "@/contexts/FetchContext";
import { useFormInfo } from "@/contexts/FormInfoContext";
import { useEffect, useState } from "react";

function useOrdenReparacionDelCliente(clienteId: number) {
  const { isEditing } = useFormInfo();
  const [ordenesReparacion, setOrdenesReparacion] = useState<
    { value: number; label: string }[]
  >([]);
  const { authFetch } = useFetch();
  useEffect(() => {
    const fetchOrdenesReparacion = async () => {
      if (!clienteId) {
        return;
      }

      try {
        const url = isEditing
          ? `/api/clientes/${clienteId}/orden-reparacion`
          : `/api/clientes/${clienteId}/orden-reparacion?soloConDeuda=true&limit=10&page=0`;
        const response = await authFetch(url);
        const data = await response.json();
        const ordenes = data.map((orden: any) => ({
          value: orden.id,
          label: `#${orden.id} - ${orden.auto.patent} ${orden.auto.brand} ${
            orden.auto.model
          }: ${
            orden.fechaEntradaReparacion
              ? new Date(orden.fechaEntradaReparacion).toLocaleDateString(
                  "es-AR"
                )
              : "Sin Fecha de entrada"
          }`,
        }));
        setOrdenesReparacion(ordenes);
      } catch (error) {
        console.error("Error al obtener órdenes de reparación:", error);
      }
    };

    fetchOrdenesReparacion();
  }, [clienteId, authFetch, isEditing]);

  return { ordenesReparacion };
}

export default useOrdenReparacionDelCliente;
