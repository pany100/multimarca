import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
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

  const agregarTexto = () => {
    const prevValues = getValues(inputName);
    if (textoPersonalizado.trim()) {
      const updatedValues = [
        ...JSON.parse(prevValues),
        textoPersonalizado.trim(),
      ];
      setValue(inputName, JSON.stringify(updatedValues));
      setTextoPersonalizado("");
      setInputVisible(false);
    }
  };

  const borrarTexto = (index: number) => {
    const prevValues = getValues(inputName);
    const updatedValues = JSON.parse(prevValues).filter(
      (_: string, i: number) => i !== index
    );

    setValue(inputName, JSON.stringify(updatedValues));
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
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => borrarTexto(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ py: 0.0 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ my: 0 }}>
                        ◦ {element}
                      </Typography>
                    }
                  />
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
              />
              <Button
                size="small"
                onClick={() => {
                  setInputVisible(false);
                  setTextoPersonalizado("");
                }}
              >
                Cancelar
              </Button>
              <Button
                size="small"
                onClick={agregarTexto}
                disabled={!textoPersonalizado.trim()}
              >
                Agregar
              </Button>
            </Box>
          )}
        </>
      )}
    />
  );
}

export default TextListInput;
