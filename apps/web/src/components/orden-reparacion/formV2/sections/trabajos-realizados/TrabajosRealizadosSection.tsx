import { ModalProvider } from "@/contexts/ModalContext";
import useTrabajosRealizadosValidator from "@/hooks/orden-reparacion/useTrabajosRealizadosValidator";
import usePrecios from "@/hooks/precios/usePrecios";
import { getFormattedPrice } from "@/utils/fieldHelper";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import ResumenCostosFooter from "../resumen-costos/ResumenCostosFooter";
import TrabajosRealizadosInnerForm from "./TrabajosRealizadosInnerForm";
import TrabajosRealizadosTableColumns from "./TrabajosRealizadosTableColums";

function TrabajosRealizadosSection() {
  const { validateForm } = useTrabajosRealizadosValidator();
  const { control } = useFormContext();
  const { calculateTotalManoDeObra } = usePrecios();

  const manoDeObra = useWatch({
    name: "trabajosRealizados",
    control,
  });
  const incrementoInterno =
    useWatch({
      name: "incrementoInterno",
      control,
    }) || 0;

  // State for calculated total
  const [totalManoDeObra, setTotalManoDeObra] = useState<number>(0);

  // Use refs to track previous values and prevent unnecessary calculations
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>("");

  // Calculate total with debouncing
  useEffect(() => {
    // Create a detailed string representation for comparison
    const currentData = JSON.stringify({
      trabajosRealizados: (manoDeObra ?? []).map((t: any) => ({
        id: t.id || t.manoDeObraId,
        precioUnitario: t.precioUnitario,
        descripcion: t.descripcion,
        manoDeObra: t.manoDeObra,
        diasParaRecordatorio: t.diasParaRecordatorio,
      })),
      length: (manoDeObra ?? []).length,
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
        console.log("Calculating total mano de obra for:", manoDeObra);
        if (manoDeObra && manoDeObra.length > 0) {
          const result = await calculateTotalManoDeObra({
            trabajosRealizados: manoDeObra,
          });

          console.log("Total mano de obra calculated:", result.totalManoDeObra);
          setTotalManoDeObra(result.totalManoDeObra);
        } else {
          console.log("No mano de obra, setting total to 0");
          setTotalManoDeObra(0);
        }

        // Update previous data reference
        previousDataRef.current = currentData;
      } catch (error) {
        console.error("Error calculating total for mano de obra:", error);
        setTotalManoDeObra(0);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [manoDeObra, calculateTotalManoDeObra]);
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="trabajosRealizados"
        columns={TrabajosRealizadosTableColumns}
        form={TrabajosRealizadosInnerForm}
        validateForm={validateForm}
        extraContent={
          <ResumenCostosFooter
            descripcion="Total Mano de obra"
            total={getFormattedPrice(totalManoDeObra)}
          />
        }
      >
        <InventoryIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography color="textSecondary" gutterBottom>
          No hay trabajos realizados asignados
        </Typography>
      </FormDataArrayWithModal>
    </ModalProvider>
  );
}

export default TrabajosRealizadosSection;
