import { useFetch } from "@/contexts/FetchContext";
import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const ObservacionesEntradaForm = () => {
  const { control, setValue, getValues } = useFormContext();
  const [reparacionesAnteriores, setReparacionesAnteriores] = useState([]);
  const autoId = useWatch({ control, name: "autoId" });
  const observacionesEntrada = useWatch({
    control,
    name: "observacionesEntrada",
  });
  const isFirstRun = useRef(true);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchReparacionesAnteriores = async () => {
      if (!isFirstRun.current) {
        setReparacionesAnteriores([]);
        setValue("observacionesEntrada", "[]");
      }
      if (autoId) {
        try {
          const response = await authFetch(
            `/api/autos/${autoId}/reparaciones-anteriores`
          );
          const data = await response.json();
          setReparacionesAnteriores(data);
        } catch (error) {
          console.error("Error al obtener reparaciones anteriores:", error);
        }
      }
      isFirstRun.current = false;
    };

    fetchReparacionesAnteriores();
  }, [autoId, setValue, authFetch]);

  const agregarObservacion = (observacion: string) => {
    const prevObservaciones = getValues("observacionesEntrada");
    const nuevasObservaciones = [...JSON.parse(prevObservaciones), observacion];
    setValue("observacionesEntrada", JSON.stringify(nuevasObservaciones));
  };

  const quitarObservacion = (index: number) => {
    const prevObservaciones = getValues("observacionesEntrada");
    const nuevasObservaciones = JSON.parse(prevObservaciones).filter(
      (_: string, i: number) => i !== index
    );

    setValue("observacionesEntrada", JSON.stringify(nuevasObservaciones));
  };

  const estaObservacionAgregada = (observacion: string) => {
    const observaciones = JSON.parse(observacionesEntrada || "[]");
    return observaciones.includes(observacion);
  };

  return (
    <div>
      <Typography variant="h6">Observaciones de entrada</Typography>
      <List>
        {reparacionesAnteriores.map(
          (
            reparacion: { fechaCreacion: Date; observacionesSalida: string },
            index
          ) => (
            <ListItem key={index}>
              <ListItemText
                primary={`Reparación del ${reparacion.fechaCreacion}`}
                secondary={
                  reparacion.observacionesSalida ? (
                    JSON.parse(reparacion.observacionesSalida).length > 0 ? (
                      JSON.parse(reparacion.observacionesSalida).map(
                        (obs: string, obsIndex: number) => (
                          <Box
                            key={obsIndex}
                            display="flex"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography variant="body2">{obs}</Typography>
                            {!estaObservacionAgregada(obs) && (
                              <Button
                                size="small"
                                onClick={() => agregarObservacion(obs)}
                                sx={{ ml: 1 }}
                              >
                                Agregar
                              </Button>
                            )}
                          </Box>
                        )
                      )
                    ) : (
                      <Typography variant="body2">Sin observaciones</Typography>
                    )
                  ) : (
                    <Typography variant="body2">Sin observaciones</Typography>
                  )
                }
              />
            </ListItem>
          )
        )}
      </List>
      <Box sx={{ mb: 2 }}>
        {JSON.parse(observacionesEntrada || "[]").map(
          (obs: string, index: number) => (
            <Chip
              key={index}
              label={obs}
              onDelete={() => quitarObservacion(index)}
              sx={{ m: 0.5 }}
            />
          )
        )}
      </Box>
    </div>
  );
};

export default ObservacionesEntradaForm;
