import { useFetch } from "@/contexts/FetchContext";
import { useFormInfo } from "@/contexts/FormInfoContext";
import { useEffect, useState } from "react";

function useVentasDelCliente(clienteId: number) {
  const { isEditing } = useFormInfo();
  const [ventas, setVentas] = useState<{ value: number; label: string }[]>([]);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchVentas = async () => {
      if (!clienteId) return;
      const url = isEditing
        ? `/api/clientes/${clienteId}/ventas`
        : `/api/clientes/${clienteId}/ventas?soloConDeuda=true`;
      try {
        const response = await authFetch(url);
        const data = await response.json();
        const ventasFormateadas = data.map((venta: any) => ({
          value: venta.id,
          label: `#${venta.id} - ${new Date(venta.fecha).toLocaleDateString(
            "es-AR"
          )} - ${venta.deuda > 0 ? `Deuda: $${venta.deuda}` : "Pagada"}`,
        }));
        setVentas(ventasFormateadas);
      } catch (error) {
        console.error("Error al obtener ventas:", error);
      }
    };

    fetchVentas();
  }, [clienteId, authFetch, isEditing]);

  return { ventas };
}

export default useVentasDelCliente;
