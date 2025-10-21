import { ModalProvider } from "@/contexts/ModalContext";
import useReparacionTercerosFormValidator from "@/hooks/orden-reparacion/useReparacionTercerosFormValidator";
import usePrecios from "@/hooks/precios/usePrecios";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalReparacionesTerceros } from "@/utils/ordenHelper";
import HandymanIcon from "@mui/icons-material/Handyman";
import { Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import ResumenCostosFooter from "../resumen-costos/ResumenCostosFooter";
import ReparacionTercerosInnerForm from "./ReparacionTercerosInnerForm";
import { getReparacionTercerosTableColumns } from "./ReparacionTercerosTableColumns";

function ReparacionTercerosSection() {
  const { validator } = useReparacionTercerosFormValidator();
  const { control, setValue } = useFormContext();
  const { calculatePreciosFinalReparaciones } = usePrecios();

  const reparacionesDeTercero = useWatch({
    name: "reparacionesDeTercero",
    control,
  });
  const porcentajeRecargo = useWatch({
    name: "porcentajeRecargo",
    control,
  });

  // Use refs to track previous values and prevent unnecessary calculations
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>("");
  const isUpdatingRef = useRef<boolean>(false);

  // Calculate prices with debouncing
  useEffect(() => {
    // Skip if we're currently updating the form to avoid loops
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }

    // Create a detailed string representation for comparison
    const currentData = JSON.stringify({
      reparacionesDeTercero: (reparacionesDeTercero ?? []).map((r: any) => ({
        id: r.id || r.nombre,
        precioVenta: r.precioVenta,
      })),
      porcentajeRecargo,
      length: (reparacionesDeTercero ?? []).length,
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
        if (reparacionesDeTercero && reparacionesDeTercero.length > 0) {
          const result = await calculatePreciosFinalReparaciones({
            reparacionesTerceros: reparacionesDeTercero,
            porcentajeRecargo: porcentajeRecargo || 0,
          });

          // Update the form with calculated prices
          const updatedReparaciones = result.reparacionesTerceros.map(
            (reparacion: any, index: number) => ({
              ...reparacionesDeTercero[index],
              precioConRecargo: reparacion.precioConRecargo,
            })
          );

          // Set flag to prevent loop
          isUpdatingRef.current = true;
          setValue("reparacionesDeTercero", updatedReparaciones, {
            shouldValidate: false,
          });
        }

        // Update previous data reference
        previousDataRef.current = currentData;
      } catch (error) {
        console.error(
          "Error calculating final prices for reparaciones:",
          error
        );
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    reparacionesDeTercero,
    porcentajeRecargo,
    calculatePreciosFinalReparaciones,
    setValue,
  ]);

  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="reparacionesDeTercero"
        columns={getReparacionTercerosTableColumns(porcentajeRecargo)}
        form={ReparacionTercerosInnerForm}
        validateForm={validator}
        extraContent={
          <ResumenCostosFooter
            descripcion="Total Reparaciones de Terceros"
            total={getFormattedPrice(
              calcularTotalReparacionesTerceros({
                reparacionesDeTercero,
                porcentajeRecargo,
              })
            )}
          />
        }
      >
        <HandymanIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography color="textSecondary" gutterBottom>
          No hay repuestos / reparaciones de terceros asignadas
        </Typography>
      </FormDataArrayWithModal>
    </ModalProvider>
  );
}

export default ReparacionTercerosSection;
