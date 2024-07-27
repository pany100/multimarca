import { useFetch } from "@/contexts/FetchContext";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Grid,
  IconButton,
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
  if (reparacionesAnteriores.length === 0) {
    return null;
  }
  return (
    <Grid item xs={12} sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 0 }}>
        Observaciones de entrada
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 0 }}>
        Reparaciones Previas
      </Typography>
      <List sx={{ mt: 0 }}>
        {reparacionesAnteriores.map(
          (
            reparacion: { fechaCreacion: Date; observacionesSalida: string },
            index
          ) => (
            <ListItem key={index} sx={{ py: 0.0 }}>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ mb: 0 }}
                  >
                    • Reparación del{" "}
                    {new Date(reparacion.fechaCreacion).toLocaleDateString()}
                  </Typography>
                }
                secondary={
                  reparacion.observacionesSalida ? (
                    JSON.parse(reparacion.observacionesSalida).length > 0 ? (
                      <List dense sx={{ py: 0 }}>
                        {JSON.parse(reparacion.observacionesSalida).map(
                          (obs: string, obsIndex: number) => (
                            <ListItem key={obsIndex} sx={{ py: 0 }}>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" sx={{ my: 0 }}>
                                    ◦ {obs}
                                  </Typography>
                                }
                              />
                              {!estaObservacionAgregada(obs) && (
                                <Button
                                  size="small"
                                  onClick={() => agregarObservacion(obs)}
                                  sx={{ ml: 1, py: 0 }}
                                >
                                  Agregar
                                </Button>
                              )}
                            </ListItem>
                          )
                        )}
                      </List>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 0 }}>
                        Sin observaciones
                      </Typography>
                    )
                  ) : (
                    <Typography variant="body2" sx={{ mt: 0 }}>
                      Sin observaciones
                    </Typography>
                  )
                }
              />
            </ListItem>
          )
        )}
      </List>
      {JSON.parse(observacionesEntrada || "[]").length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 0 }}>
            Observaciones Agregadas
          </Typography>
          <List sx={{ mt: 0, py: 0 }}>
            {JSON.parse(observacionesEntrada || "[]").map(
              (obs: string, index: number) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => quitarObservacion(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ py: 0.0 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ my: 0 }}>
                        ◦ {obs}
                      </Typography>
                    }
                  />
                </ListItem>
              )
            )}
          </List>
        </>
      )}
    </Grid>
  );
};

export default ObservacionesEntradaForm;
