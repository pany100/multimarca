import { ModalProvider } from "@/contexts/ModalContext";
import useRepuestosUsadosInnerForm from "@/hooks/orden-reparacion/useRepuestosUsadosInnerForm";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalRepuestos } from "@/utils/ordenHelper";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import ResumenCostosFooter from "../resumen-costos/ResumenCostosFooter";
import RepuestosUsadosInnerForm from "./RepuestosUsadosInnerForm";
import RepuestosUsadosTableColumns from "./RepuestosUsadosTableColumns";

function RepuestosUsadosSection() {
  const { validateRepuestosUsados } = useRepuestosUsadosInnerForm();
  const { control } = useFormContext();
  const repuestosUsados = useWatch({
    name: "repuestosUsados",
    control,
  });

  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="repuestosUsados"
        columns={RepuestosUsadosTableColumns}
        form={RepuestosUsadosInnerForm}
        validateForm={validateRepuestosUsados}
        extraContent={
          <ResumenCostosFooter
            descripcion="Total Repuestos"
            total={getFormattedPrice(
              calcularTotalRepuestos({ repuestosUsados })
            )}
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
