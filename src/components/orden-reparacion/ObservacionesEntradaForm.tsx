import { useFetch } from "@/contexts/FetchContext";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const ObservacionesEntradaForm = () => {
  const { control, setValue, getValues } = useFormContext();
  const [reparacionesAnteriores, setReparacionesAnteriores] = useState([]);
  const [textoPersonalizado, setTextoPersonalizado] = useState("");
  const [mostrarInput, setMostrarInput] = useState(false);

  const autoId = useWatch({ control, name: "autoId" });
  const observacionesEntrada = useWatch({
    control,
    name: "observacionesEntrada",
  });
  const isFirstRun = useRef(true);
  const { authFetch } = useFetch();

  const agregarObservacionPersonalizada = () => {
    if (textoPersonalizado.trim()) {
      agregarObservacion(textoPersonalizado.trim());
      setTextoPersonalizado("");
      setMostrarInput(false);
    }
  };

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
    <>
      <Typography variant="h6" sx={{ mb: 0 }}>
        Observaciones de entrada
      </Typography>
      {reparacionesAnteriores.length > 0 && (
        <Typography variant="subtitle1" sx={{ mb: 0 }}>
          Reparaciones Previas
        </Typography>
      )}
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
                              {!estaObservacionAgregada(obs) ? (
                                <Button
                                  size="small"
                                  onClick={() => agregarObservacion(obs)}
                                  sx={{ ml: 1, py: 0 }}
                                >
                                  Agregar
                                </Button>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ ml: 1, py: 0, color: "lightgreen" }}
                                >
                                  <CheckIcon
                                    sx={{
                                      ml: 1,
                                      verticalAlign: "middle",
                                    }}
                                  />
                                </Typography>
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
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="contained"
          onClick={() => setMostrarInput(true)}
          sx={{ mb: 2 }}
          disabled={mostrarInput}
        >
          Agregar observación
        </Button>
      </Box>
      {mostrarInput && (
        <>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              multiline
              rows={3}
              value={textoPersonalizado}
              onChange={(e) => setTextoPersonalizado(e.target.value)}
              placeholder="Agregar observación personalizada"
              sx={{ flex: 1 }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  agregarObservacionPersonalizada();
                }
              }}
            />
            <Button
              size="small"
              onClick={() => {
                setMostrarInput(false);
                setTextoPersonalizado("");
              }}
            >
              Cancelar
            </Button>
            <Button
              size="small"
              onClick={agregarObservacionPersonalizada}
              disabled={!textoPersonalizado.trim()}
            >
              Agregar
            </Button>
          </Box>
        </>
      )}
      <Divider sx={{ mt: 1 }} />
    </>
  );
};

export default ObservacionesEntradaForm;
