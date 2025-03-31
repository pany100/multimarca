import { ModalProvider } from "@/contexts/ModalContext";
import useReparacionTercerosFormValidator from "@/hooks/orden-reparacion/useReparacionTercerosFormValidator";
import HandymanIcon from "@mui/icons-material/Handyman";
import { Typography } from "@mui/material";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import ReparacionTercerosInnerForm from "./ReparacionTercerosInnerForm";
import { ReparacionTercerosTableColumns } from "./ReparacionTercerosTableColumns";

function ReparacionTercerosSection() {
  const { validator } = useReparacionTercerosFormValidator();
  return (
    <ModalProvider>
      <FormDataArrayWithModal
        fieldName="reparacionesDeTercero"
        columns={ReparacionTercerosTableColumns}
        form={ReparacionTercerosInnerForm}
        validateForm={validator}
      >
        <HandymanIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography color="textSecondary" gutterBottom>
          No hay repuestos / reparaciones de terceros asignadas
        </Typography>
      </FormDataArrayWithModal>
    </ModalProvider>
  );
}

export default ReparacionTercerosSection;
