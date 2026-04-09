import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import usePrecios from "@/hooks/precios/usePrecios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";

type Props = {
  control: any;
};

function useNuevaOrden({ control }: Props) {
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
  const incrementoInterno =
    useWatch({ control, name: "incrementoInterno" }) || 0;
  const porcentajeRecargo =
    useWatch({ control, name: "porcentajeRecargo" }) || 0;
  const ajustesPrecio = useWatch({ control, name: "ajustesPrecio" });
  const modoAjustes = useWatch({ control, name: "modoAjustes" }) || "sobreTotalBase";

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
        precio: r.precioVenta 
      })),
      reparacionesDeTercero: (reparacionesTerceros ?? []).map((r: any) => ({ 
        id: r.id || r.nombre, 
        precio: r.precioVenta 
      })),
      trabajosRealizados: (trabajosRealizados ?? []).map((t: any) => ({ 
        id: t.id || t.descripcion, 
        precio: t.precioUnitario 
      })),
      descuento,
      incremento,
      incrementoInterno,
      porcentajeRecargo,
      ajustesPrecio: (ajustesPrecio ?? []).map((a: any) => ({
        descripcion: a.descripcion,
        monto: a.monto,
        tipo: a.tipo,
        esDescuento: a.esDescuento,
        esInterno: a.esInterno,
      })),
      modoAjustes,
      // Add array lengths to ensure deletion detection
      lengths: {
        repuestos: (repuestosUsados ?? []).length,
        terceros: (reparacionesTerceros ?? []).length,
        trabajos: (trabajosRealizados ?? []).length,
      }
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
          incrementoInterno,
          porcentajeRecargo,
          ajustesPrecio: ajustesPrecio ?? [],
          modoAjustes,
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
    incrementoInterno,
    porcentajeRecargo,
    ajustesPrecio,
    modoAjustes,
    calculatePrecios,
  ]);

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/orden-reparacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Orden de reparación creada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ordenes-reparacion");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la orden de reparación",
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

  const presupuestoSubmit = async (data: any) => {
    try {
      const endpoint = "/api/presupuestos";
      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Presupuesto creado con éxito",
          severity: "success",
        });
        router.push("/dashboard/presupuestos");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear el presupuesto",
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

  const handlePresupuestoEdit = async (data: any) => {
    try {
      const response = await authFetch(`/api/presupuestos/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Presupuesto actualizado con éxito",
          severity: "success",
        });
        router.push("/dashboard/presupuestos");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al actualizar el presupuesto",
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
    presupuestoSubmit,
    onSubmit,
    handlePresupuestoEdit,
    snackbar,
    setSnackbar,
    manoDeObra: precios.totalManoDeObra,
    totalOrdenReparacion: precios.totalAPagar,
    precios,
  };
}

export default useNuevaOrden;
