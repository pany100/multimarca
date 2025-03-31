import { ModalProvider } from "@/contexts/ModalContext";
import OutputIcon from "@mui/icons-material/Output";
import { Typography } from "@mui/material";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import OutputDetallesForm from "./OutputDetallesForm";
import TableColumns from "./TableColumns";

function OutputObservationsSection() {
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="observacionesSalida"
        columns={TableColumns}
        form={OutputDetallesForm}
        rowsTransform={(row, index) => ({
          id: index + 1,
          value: row,
        })}
      >
        <OutputIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography color="textSecondary" gutterBottom>
          Sin observaciones de salida agregadas
        </Typography>
      </FormDataArrayWithModal>
    </ModalProvider>
  );
}

export default OutputObservationsSection;
