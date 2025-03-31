import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import OtrosTrabajosForm from "./OtrosTrabajosForm";
import TrabajoDeListaForm from "./TrabajoDeListaForm";

function TrabajosRealizadosInnerForm() {
  const [tipoTrabajo, setTipoTrabajo] = useState<"lista" | "otros">("lista");
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();

  return (
    <Box sx={{ mb: 3 }}>
      <ToggleButtonGroup
        value={tipoTrabajo}
        exclusive
        onChange={(
          _: React.MouseEvent<HTMLElement>,
          newTipoTrabajo: "lista" | "otros" | null
        ) => {
          if (newTipoTrabajo !== null) {
            setTipoTrabajo(newTipoTrabajo);
          }
        }}
        aria-label="tipo de trabajo"
        fullWidth
        color="primary"
        sx={{ mt: 1 }}
      >
        <ToggleButton value="lista" aria-label="trabajo de lista">
          Trabajo de Lista
        </ToggleButton>
        <ToggleButton value="otros" aria-label="otros trabajos">
          Otros Trabajos
        </ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ mt: 2 }}>
        {tipoTrabajo === "lista" ? (
          <TrabajoDeListaForm />
        ) : (
          <OtrosTrabajosForm />
        )}
      </Box>
    </Box>
  );
}

export default TrabajosRealizadosInnerForm;
