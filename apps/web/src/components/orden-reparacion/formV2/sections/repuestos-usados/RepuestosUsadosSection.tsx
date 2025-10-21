import { ModalProvider } from "@/contexts/ModalContext";
import useRepuestosUsadosInnerForm from "@/hooks/orden-reparacion/useRepuestosUsadosInnerForm";
import usePrecios from "@/hooks/precios/usePrecios";
import { getFormattedPrice } from "@/utils/fieldHelper";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import ResumenCostosFooter from "../resumen-costos/ResumenCostosFooter";
import RepuestosUsadosInnerForm from "./RepuestosUsadosInnerForm";
import { getRepuestosUsadosTableColumns } from "./RepuestosUsadosTableColumns";

function RepuestosUsadosSection() {
  const { validateRepuestosUsados } = useRepuestosUsadosInnerForm();
  const { control } = useFormContext();
  const { calculateTotalRepuestos } = usePrecios();

  const repuestosUsados = useWatch({
    name: "repuestosUsados",
    control,
  });

  const porcentajeRecargo = useWatch({
    name: "porcentajeRecargo",
    control,
  });

  // State for calculated total
  const [totalRepuestos, setTotalRepuestos] = useState<number>(0);

  // Use refs to track previous values and prevent unnecessary calculations
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>("");

  // Calculate total with debouncing
  useEffect(() => {
    // Create a detailed string representation for comparison
    const currentData = JSON.stringify({
      repuestosUsados: (repuestosUsados ?? []).map((r: any) => ({
        id: r.id || r.stockId,
        precioVenta: r.precioVenta,
        unidadesConsumidas: r.unidadesConsumidas,
      })),
      length: (repuestosUsados ?? []).length,
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
        if (repuestosUsados && repuestosUsados.length > 0) {
          const result = await calculateTotalRepuestos({
            repuestosUsados: repuestosUsados,
          });

          setTotalRepuestos(result.totalRepuestos);
        } else {
          setTotalRepuestos(0);
        }

        // Update previous data reference
        previousDataRef.current = currentData;
      } catch (error) {
        console.error("Error calculating total for repuestos:", error);
        setTotalRepuestos(0);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [repuestosUsados, calculateTotalRepuestos]);

  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="repuestosUsados"
        columns={getRepuestosUsadosTableColumns()}
        form={RepuestosUsadosInnerForm}
        validateForm={validateRepuestosUsados}
        extraContent={
          <ResumenCostosFooter
            descripcion="Total Repuestos"
            total={getFormattedPrice(totalRepuestos)}
          />
        }
      >
        <InventoryIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography color="textSecondary" gutterBottom>
          No hay repuestos asignados
        </Typography>
      </FormDataArrayWithModal>
    </ModalProvider>
  );
}

export default RepuestosUsadosSection;
