import { useFetch } from "@/contexts/FetchContext";
import { useEffect } from "react";

type Props = {
  templateId: number | null | undefined;
  setValue: any;
};

function usePresupuestoTemplate({ templateId, setValue }: Props) {
  const { authFetch } = useFetch();
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (templateId) {
        try {
          const response = await authFetch(
            `/api/plantilla-presupuesto/${templateId}`
          );
          if (response.ok) {
            const templateData = await response.json();
            setValue(
              "repuestosUsados",
              templateData.repuestosUsados.map((repuesto: any) => ({
                stock: { id: repuesto.stockId, name: repuesto.stock.name },
                precioCompra: Number(repuesto.precioCompra),
                precioVenta: Number(repuesto.precioVenta),
                unidadesConsumidas: repuesto.unidadesConsumidas,
              }))
            );
            setValue(
              "reparacionesDeTercero",
              templateData.reparacionesDeTercero.map((reparacion: any) => ({
                nombre: reparacion.nombre,
                precioCompra: Number(reparacion.precioCompra),
                precioVenta: Number(reparacion.precioVenta),
                proveedor: {
                  id: reparacion.proveedorId,
                  name: reparacion.proveedor.name,
                },
              }))
            );
            setValue(
              "trabajosRealizados",
              templateData.trabajosRealizados.map((trabajo: any) => ({
                manoDeObra: { name: trabajo.descripcion },
                precioUnitario: Number(trabajo.precioUnitario),
                diasParaRecordatorio: trabajo.diasParaRecordatorio,
              }))
            );
          } else {
            console.error("Error al obtener datos de la plantilla");
          }
        } catch (error) {
          console.error("Error al obtener datos de la plantilla:", error);
        }
      }
    };

    fetchTemplateData();
  }, [templateId, authFetch, setValue]);
}

export default usePresupuestoTemplate;
