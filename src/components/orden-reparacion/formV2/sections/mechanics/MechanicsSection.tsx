import { ModalProvider } from "@/contexts/ModalContext";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import MechanicsInnerForm from "./MechanicsInnerForm";
import MechanicsTableColumns from "./MechanicsTableColums";

function MechanicsSection() {
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="mecanicos"
        columns={MechanicsTableColumns}
        form={MechanicsInnerForm}
      />
    </ModalProvider>
  );
}

export default MechanicsSection;
