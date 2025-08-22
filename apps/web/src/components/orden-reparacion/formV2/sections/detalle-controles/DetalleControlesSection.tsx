import { ModalProvider } from "@/contexts/ModalContext";
import DetailsIcon from "@mui/icons-material/Details";
import { Typography } from "@mui/material";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import InputDetallesForm from "./InputDetallesForm";
import TableColumns from "./TableColumns";

function DetalleControlesSection() {
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="detalleControles"
        columns={TableColumns}
        form={InputDetallesForm}
        rowsTransform={(row, index) => ({
          id: index + 1,
          value: row,
        })}
      >
        <DetailsIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography color="textSecondary" gutterBottom>
          Sin detalles agregados
        </Typography>
      </FormDataArrayWithModal>
    </ModalProvider>
  );
}

export default DetalleControlesSection;
