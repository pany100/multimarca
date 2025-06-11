import { ModalProvider } from "@/contexts/ModalContext";
import useTrabajosRealizadosValidator from "@/hooks/orden-reparacion/useTrabajosRealizadosValidator";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalManoDeObra } from "@/utils/ordenHelper";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import ResumenCostosFooter from "../resumen-costos/ResumenCostosFooter";
import TrabajosRealizadosInnerForm from "./TrabajosRealizadosInnerForm";
import TrabajosRealizadosTableColumns from "./TrabajosRealizadosTableColums";

function TrabajosRealizadosSection() {
  const { validateForm } = useTrabajosRealizadosValidator();
  const { control } = useFormContext();
  const manoDeObra = useWatch({
    name: "trabajosRealizados",
    control,
  });
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
            total={getFormattedPrice(calcularTotalManoDeObra(manoDeObra))}
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
