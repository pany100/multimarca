import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import usePrecios from "@/hooks/precios/usePrecios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";

type Props = {
  control: any;
};

function useNuevaVenta({ control }: Props) {
  const { authFetch } = useFetch();
  const router = useRouter();
  const { snackbar, setSnackbar } = useSnackbarContext();
  const { calculatePrecios } = usePrecios();

  // State for calculated prices
  const [precios, setPrecios] = useState({
    totalAPagar: 0,
    totalManoDeObra: 0,
    totalRepuestos: 0,
    totalTerceros: 0,
    totalPagado: 0,
    deuda: 0,
  });

  // Watch form values
  const repuestosUsados = useWatch({ control, name: "repuestosUsados" });
  const reparacionesTerceros = useWatch({
    control,
    name: "reparacionesDeTercero",
  });
  const trabajosRealizados = useWatch({ control, name: "trabajosRealizados" });
  const descuento = useWatch({ control, name: "descuento" }) || 0;
  const incremento = useWatch({ control, name: "incremento" }) || 0;
  const porcentajeRecargo =
    useWatch({ control, name: "porcentajeRecargo" }) || 0;

  // Use refs to track previous values and prevent unnecessary calculations
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>("");

  // Calculate prices with debouncing
  useEffect(() => {
    // Create a more detailed string representation for comparison
    const currentData = JSON.stringify({
      repuestosUsados: (repuestosUsados ?? []).map((r: any) => ({
        id: r.id || r.stockId,
        cantidad: r.unidadesConsumidas,
        precio: r.precioVenta,
      })),
      reparacionesDeTercero: (reparacionesTerceros ?? []).map((r: any) => ({
        id: r.id || r.nombre,
        precio: r.precioVenta,
      })),
      trabajosRealizados: (trabajosRealizados ?? []).map((t: any) => ({
        id: t.id || t.descripcion,
        precio: t.precioUnitario,
      })),
      descuento,
      incremento,
      porcentajeRecargo,
      // Add array lengths to ensure deletion detection
      lengths: {
        repuestos: (repuestosUsados ?? []).length,
        terceros: (reparacionesTerceros ?? []).length,
        trabajos: (trabajosRealizados ?? []).length,
      },
    });

    // Only proceed if data actually changed
    if (currentData === previousDataRef.current) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced calculation
    timeoutRef.current = setTimeout(async () => {
      try {
        // Always calculate prices, even with empty arrays (to reset totals)
        const preciosCalculados = await calculatePrecios({
          repuestosUsados: repuestosUsados ?? [],
          reparacionesDeTercero: reparacionesTerceros ?? [],
          trabajosRealizados: trabajosRealizados ?? [],
          descuento,
          incremento,
          incrementoInterno: 0, // Ventas no usan incremento interno
          porcentajeRecargo,
        });
        setPrecios(preciosCalculados);

        // Update previous data reference
        previousDataRef.current = currentData;
      } catch (error) {
        console.error("Error calculating prices:", error);
        // Reset prices on error
        setPrecios({
          totalAPagar: 0,
          totalManoDeObra: 0,
          totalRepuestos: 0,
          totalTerceros: 0,
          totalPagado: 0,
          deuda: 0,
        });
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    repuestosUsados,
    reparacionesTerceros,
    trabajosRealizados,
    descuento,
    incremento,
    porcentajeRecargo,
    calculatePrecios,
  ]);

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Venta creada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ventas");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la venta",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de creación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };

  return {
    onSubmit,
    snackbar,
    setSnackbar,
    manoDeObra: precios.totalManoDeObra,
    totalOrdenReparacion: precios.totalAPagar,
    precios,
  };
}

export default useNuevaVenta;
