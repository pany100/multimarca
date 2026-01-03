import { useGetCurrentManoDeObra } from "@/hooks/orden-reparacion/useGetCurrentManoDeObra";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { useTrabajosContext } from "../contexts/TrabajosContext";
import OtrosTrabajosForm from "./OtrosTrabajosForm";
import TrabajoDeListaForm from "./TrabajoDeListaForm";

interface ManoDeObra {
  id: number;
  name: string;
  sellPrice: string;
}

function TrabajosModalContent() {
  const { getCurrentManoDeObra } = useGetCurrentManoDeObra();
  const [tipoTrabajo, setTipoTrabajo] = useState<"lista" | "otros">("lista");
  const [initialManoDeObra, setInitialManoDeObra] = useState<ManoDeObra | null>(
    null
  );
  const { descripcion } = useTrabajosContext();

  useEffect(() => {
    if (descripcion) {
      getCurrentManoDeObra(descripcion).then((manoDeObra) => {
        console.log(manoDeObra);
        setInitialManoDeObra(manoDeObra);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!descripcion || initialManoDeObra) {
      setTipoTrabajo("lista");
    } else {
      setTipoTrabajo("otros");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialManoDeObra]);

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
          <TrabajoDeListaForm initialManoDeObra={initialManoDeObra} />
        ) : (
          <OtrosTrabajosForm />
        )}
      </Box>
    </Box>
  );
}

export default TrabajosModalContent;
