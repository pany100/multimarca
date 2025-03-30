import { ModalProvider } from "@/contexts/ModalContext";
import useMechanicsInnerForm from "@/hooks/orden-reparacion/useMechanicsInnerForm";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Typography } from "@mui/material";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import MechanicsInnerForm from "./MechanicsInnerForm";
import MechanicsTableColumns from "./MechanicsTableColums";

function MechanicsSection() {
  const { validateForm } = useMechanicsInnerForm();
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="mecanicos"
        columns={MechanicsTableColumns}
        form={MechanicsInnerForm}
        validateForm={validateForm}
      >
        <EngineeringIcon
          sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
        />
        <Typography color="textSecondary" gutterBottom>
          No hay mecánicos asignados
        </Typography>
      </FormDataArrayWithModal>
    </ModalProvider>
  );
}

export default MechanicsSection;
