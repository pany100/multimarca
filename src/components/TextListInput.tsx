import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  inputName: string;
  label: string;
};

function TextListInput({ inputName, label }: Props) {
  const { control, setValue, getValues } = useFormContext();
  const [inputVisible, setInputVisible] = useState(false);
  const [textoPersonalizado, setTextoPersonalizado] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const agregarTexto = () => {
    const prevValues = getValues(inputName);
    if (textoPersonalizado.trim()) {
      const updatedValues =
        editingIndex !== null
          ? JSON.parse(prevValues).map((text: string, i: number) =>
              i === editingIndex ? textoPersonalizado.trim() : text
            )
          : [...JSON.parse(prevValues), textoPersonalizado.trim()];

      setValue(inputName, JSON.stringify(updatedValues));
      setTextoPersonalizado("");
      setInputVisible(false);
      setEditingIndex(null);
    }
  };

  const editarTexto = (index: number, texto: string) => {
    setTextoPersonalizado(texto);
    setEditingIndex(index);
  };

  const borrarTexto = (index: number) => {
    const prevValues = getValues(inputName);
    const updatedValues = JSON.parse(prevValues).filter(
      (_: string, i: number) => i !== index
    );

    setValue(inputName, JSON.stringify(updatedValues));
  };

  const cancelarEdicion = () => {
    setTextoPersonalizado("");
    setEditingIndex(null);
  };

  return (
    <Controller
      name={inputName}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
            {label}
          </Typography>
          <List sx={{ mt: 0, py: 0 }}>
            {JSON.parse(field.value || "[]").map(
              (element: string, index: number) => (
                <ListItem
                  key={index}
                  sx={{
                    py: 0.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {editingIndex === index ? (
                      <TextField
                        value={textoPersonalizado}
                        onChange={(e) => setTextoPersonalizado(e.target.value)}
                        autoFocus
                        size="small"
                        fullWidth
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            agregarTexto();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            cancelarEdicion();
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        ◦ {element}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", flexShrink: 0 }}>
                    {editingIndex !== index ? (
                      <>
                        <IconButton
                          size="small"
                          aria-label="edit"
                          onClick={() => editarTexto(index, element)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="delete"
                          onClick={() => borrarTexto(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Button size="small" onClick={cancelarEdicion}>
                          Cancelar
                        </Button>
                        <Button
                          size="small"
                          onClick={agregarTexto}
                          disabled={!textoPersonalizado.trim()}
                        >
                          Guardar
                        </Button>
                      </>
                    )}
                  </Box>
                </ListItem>
              )
            )}
          </List>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={() => setInputVisible(true)} variant="contained">
              Agregar {label}
            </Button>
          </Box>
          {error && <Typography color="error">{error.message}</Typography>}
          {inputVisible && (
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                multiline
                value={textoPersonalizado}
                onChange={(e) => setTextoPersonalizado(e.target.value)}
                placeholder={label}
                sx={{ flex: 1 }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setInputVisible(false);
                    setTextoPersonalizado("");
                    setEditingIndex(null);
                  }
                }}
              />
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <Button
                  size="small"
                  onClick={() => {
                    setInputVisible(false);
                    setTextoPersonalizado("");
                    setEditingIndex(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="small"
                  onClick={agregarTexto}
                  disabled={!textoPersonalizado.trim()}
                >
                  {editingIndex !== null ? "Guardar" : "Agregar"}
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    />
  );
}

export default TextListInput;
