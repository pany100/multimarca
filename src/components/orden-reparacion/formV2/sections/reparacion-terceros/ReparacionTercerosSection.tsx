import { ModalProvider } from "@/contexts/ModalContext";
import useReparacionTercerosFormValidator from "@/hooks/orden-reparacion/useReparacionTercerosFormValidator";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalReparacionesTerceros } from "@/utils/ordenHelper";
import HandymanIcon from "@mui/icons-material/Handyman";
import { Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import ResumenCostosFooter from "../resumen-costos/ResumenCostosFooter";
import ReparacionTercerosInnerForm from "./ReparacionTercerosInnerForm";
import { ReparacionTercerosTableColumns } from "./ReparacionTercerosTableColumns";

function ReparacionTercerosSection() {
  const { validator } = useReparacionTercerosFormValidator();
  const { control } = useFormContext();
  const reparacionesDeTercero = useWatch({
    name: "reparacionesDeTercero",
    control,
  });

  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="reparacionesDeTercero"
        columns={ReparacionTercerosTableColumns}
        form={ReparacionTercerosInnerForm}
        validateForm={validator}
        extraContent={
          <ResumenCostosFooter
            descripcion="Total Reparaciones de Terceros"
            total={getFormattedPrice(
              calcularTotalReparacionesTerceros({ reparacionesDeTercero })
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
