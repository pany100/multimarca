import { ModalProvider } from "@/contexts/ModalContext";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { Typography } from "@mui/material";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import PreviousReparations from "../previous-observations/PreviousReparations";
import InputObservationForm from "./InputObservationForm";
import TableColumns from "./TableColumns";

function InputObservationSection() {
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="observacionesEntrada"
        columns={TableColumns}
        form={InputObservationForm}
        rowsTransform={(row, index) => ({
          id: index + 1,
          value: row,
        })}
      >
        <PlaylistAddIcon
          sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
        />
        <Typography color="textSecondary" gutterBottom>
          Sin observaciones agregadas
        </Typography>
      </FormDataArrayWithModal>

      <PreviousReparations />
    </ModalProvider>
  );
}

export default InputObservationSection;
