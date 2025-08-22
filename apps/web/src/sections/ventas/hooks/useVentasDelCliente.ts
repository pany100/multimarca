import { useFetch } from "@/contexts/FetchContext";
import { useFormInfo } from "@/contexts/FormInfoContext";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

function useVentasDelCliente() {
  const { isEditing } = useFormInfo();
  const { watch } = useFormContext();

  const clienteId = watch("clienteId");
  const informacionCliente = watch("informacionCliente");
  const [ventas, setVentas] = useState<{ value: number; label: string }[]>([]);
  const { authFetch } = useFetch();

  useEffect(() => {
    let url = "";
    const fetchVentas = async () => {
      if (!clienteId && !informacionCliente) return;
      if (clienteId) {
        url = isEditing
          ? `/api/clientes/${clienteId}/ventas`
          : `/api/clientes/${clienteId}/ventas?soloConDeuda=true`;
      } else {
        url = isEditing
          ? `/api/ventas/informacion-cliente/${informacionCliente}`
          : `/api/ventas/informacion-cliente/${informacionCliente}?soloConDeuda=true`;
      }
      try {
        console.log(url);
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
  }, [clienteId, authFetch, isEditing, informacionCliente]);

  return { ventas };
}

export default useVentasDelCliente;
