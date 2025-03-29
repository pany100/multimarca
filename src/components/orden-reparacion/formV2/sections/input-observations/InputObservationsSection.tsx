import { ModalProvider } from "@/contexts/ModalContext";
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
      />
      <PreviousReparations />
    </ModalProvider>
  );
}

export default InputObservationSection;
