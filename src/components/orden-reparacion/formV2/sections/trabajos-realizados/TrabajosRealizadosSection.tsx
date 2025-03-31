import { ModalProvider } from "@/contexts/ModalContext";
import useTrabajosRealizadosValidator from "@/hooks/orden-reparacion/useTrabajosRealizadosValidator";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Typography } from "@mui/material";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import TrabajosRealizadosInnerForm from "./TrabajosRealizadosInnerForm";
import TrabajosRealizadosTableColumns from "./TrabajosRealizadosTableColums";

function TrabajosRealizadosSection() {
  const { validateForm } = useTrabajosRealizadosValidator();
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="trabajosRealizados"
        columns={TrabajosRealizadosTableColumns}
        form={TrabajosRealizadosInnerForm}
        validateForm={validateForm}
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
