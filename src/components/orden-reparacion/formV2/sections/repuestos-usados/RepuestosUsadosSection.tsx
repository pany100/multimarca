import { ModalProvider } from "@/contexts/ModalContext";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Typography } from "@mui/material";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import RepuestosUsadosInnerForm from "./RepuestosUsadosInnerForm";
import RepuestosUsadosTableColumns from "./RepuestosUsadosTableColumns";

function RepuestosUsadosSection() {
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="repuestosUsados"
        columns={RepuestosUsadosTableColumns}
        form={RepuestosUsadosInnerForm}
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
