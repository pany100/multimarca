import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  inputName: string;
  label: string;
  maxLength?: number;
  placeholder?: string;
};

function TextListInput({
  inputName,
  label,
  maxLength = 1024,
  placeholder,
}: Props) {
  const { control, setValue, getValues } = useFormContext();
  const [inputVisible, setInputVisible] = useState(false);
  const [textoPersonalizado, setTextoPersonalizado] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Focus input field when it becomes visible
  useEffect(() => {
    if (inputVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [inputVisible]);

  const agregarTexto = () => {
    const prevValues = getValues(inputName) || "[]";
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
    setInputVisible(true);
  };

  const borrarTexto = (index: number) => {
    const prevValues = getValues(inputName);
    const updatedValues = JSON.parse(prevValues).filter(
      (_: string, i: number) => i !== index
    );

    setValue(inputName, JSON.stringify(updatedValues));
    setDeleteIndex(null);
  };

  const cancelarEdicion = () => {
    setTextoPersonalizado("");
    setEditingIndex(null);
    setInputVisible(false);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      agregarTexto();
    } else if (e.key === "Escape") {
      cancelarEdicion();
    }
  };

  return (
    <Controller
      name={inputName}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const items = JSON.parse(field.value || "[]");

        return (
          <Paper
            elevation={0}
            sx={{
              p: 0,
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <Box sx={{ pb: items.length > 0 ? 1 : 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {label}
              </Typography>

              {items.length === 0 && !inputVisible && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, mb: 2 }}
                >
                  No hay {label.toLowerCase()} agregados. Haga clic en el botón
                  para agregar.
                </Typography>
              )}
            </Box>

            {items.length > 0 && (
              <List sx={{ py: 0 }}>
                {items.map((element: string, index: number) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: 1,
                      px: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom:
                        index < items.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          mr: 1,
                          color: "text.secondary",
                          display: "inline-block",
                          width: "12px",
                        }}
                      >
                        •
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: "break-word",
                          ...(editingIndex === index && {
                            color: "primary.main",
                            fontWeight: "medium",
                          }),
                        }}
                      >
                        {element}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexShrink: 0,
                        ml: 1,
                      }}
                    >
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          aria-label={`Editar ${label.toLowerCase()}`}
                          onClick={() => editarTexto(index, element)}
                          sx={{
                            color: "action.active",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          aria-label={`Eliminar ${label.toLowerCase()}`}
                          onClick={() => setDeleteIndex(index)}
                          sx={{
                            color: "action.active",
                            "&:hover": {
                              color: "error.main",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}

            <Box
              sx={{
                p: 2,
                pt: items.length > 0 ? 1 : 2,
                display: "flex",
                justifyContent: "flex-end",
                bgcolor: "background.default",
                borderTop: items.length > 0 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Button
                onClick={() => setInputVisible(true)}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={inputVisible}
                aria-label={`Agregar ${label.toLowerCase()}`}
                sx={{
                  borderRadius: 1.5,
                  boxShadow: 1,
                }}
              >
                Agregar {label.toLowerCase()}
              </Button>
            </Box>

            {error && (
              <Typography
                color="error"
                variant="caption"
                sx={{ mt: 1, display: "block" }}
              >
                {error.message}
              </Typography>
            )}

            {/* Input dialog for adding/editing */}
            <Dialog
              open={inputVisible}
              onClose={cancelarEdicion}
              fullWidth
              maxWidth="sm"
              fullScreen={isMobile}
              aria-labelledby="detalle-dialog-title"
            >
              <DialogTitle id="detalle-dialog-title">
                {editingIndex !== null
                  ? `Editar ${label.toLowerCase()}`
                  : `Agregar ${label.toLowerCase()}`}
              </DialogTitle>

              <DialogContent>
                <TextField
                  autoFocus
                  inputRef={inputRef}
                  multiline
                  rows={3}
                  value={textoPersonalizado}
                  onChange={(e) => {
                    if (e.target.value.length <= maxLength) {
                      setTextoPersonalizado(e.target.value);
                    }
                  }}
                  placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  onKeyDown={handleKeyDown}
                  inputProps={{
                    maxLength: maxLength,
                    "aria-label": label,
                  }}
                  helperText={`${textoPersonalizado.length}/${maxLength} caracteres`}
                />
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={cancelarEdicion} color="inherit">
                  Cancelar
                </Button>
                <Button
                  onClick={agregarTexto}
                  disabled={!textoPersonalizado.trim()}
                  variant="contained"
                  color="primary"
                >
                  {editingIndex !== null ? "Guardar" : "Agregar"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Confirmation dialog for deletion */}
            <Dialog
              open={deleteIndex !== null}
              onClose={() => setDeleteIndex(null)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: 3,
                  width: isMobile ? "100%" : "400px",
                  maxWidth: "95vw",
                  overflow: "hidden",
                },
              }}
            >
              <DialogTitle
                id="alert-dialog-title"
                sx={{
                  pb: 1,
                  pt: 2.5,
                  px: 3,
                  fontWeight: 500,
                  fontSize: "1.1rem",
                  color: "text.primary",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                Confirmar eliminación
              </DialogTitle>
              <DialogContent sx={{ px: 3, py: 2.5 }}>
                <DialogContentText
                  id="alert-dialog-description"
                  sx={{
                    color: "text.primary",
                    fontSize: "0.95rem",
                    mb: 0,
                    mt: 1,
                  }}
                >
                  {deleteIndex !== null && items[deleteIndex] ? (
                    <>
                      ¿Está seguro que desea eliminar el siguiente{" "}
                      {label.toLowerCase()}?
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          bgcolor: "background.default",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          fontSize: "0.9rem",
                          fontStyle: "italic",
                          color: "text.secondary",
                          wordBreak: "break-word",
                        }}
                      >
                        "{items[deleteIndex]}"
                      </Box>
                    </>
                  ) : (
                    <>
                      ¿Está seguro que desea eliminar este {label.toLowerCase()}
                      ?
                    </>
                  )}
                </DialogContentText>
              </DialogContent>
              <DialogActions
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  justifyContent: "flex-end",
                  gap: 1,
                }}
              >
                <Button
                  onClick={() => setDeleteIndex(null)}
                  color="inherit"
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    px: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() =>
                    deleteIndex !== null && borrarTexto(deleteIndex)
                  }
                  color="error"
                  variant="contained"
                  autoFocus
                  startIcon={<DeleteIcon />}
                  sx={{
                    borderRadius: 1.5,
                    px: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: 1,
                  }}
                >
                  Eliminar
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        );
      }}
    />
  );
}

export default TextListInput;
