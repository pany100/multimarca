import useUsersAutocomplete from "@/hooks/useUsersAutocomplete";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Card,
  CardContent,
  FormHelperText,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import CustomAutocompleteInput from "../formV2/CustomAutocomplete";
import CustomInputText from "../formV2/CustomInputText";

interface TareasAdministrativasProps {
  name: string;
}

const TareasAdministrativas = ({ name }: TareasAdministrativasProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  // Acceder a los errores del array
  const arrayErrors = errors[name] as any;

  const { searchUsers, initialUser } = useUsersAutocomplete();

  const handleAddTarea = () => {
    append({
      usuarioId: "",
      descripcion: "",
    });
  };

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Tareas Administrativas</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddTarea}
              >
                Agregar Tarea
              </Button>
            </Grid>

            {fields.map((field, index) => (
              <Grid container item spacing={2} key={field.id}>
                <Grid item xs={12} md={4}>
                  <CustomAutocompleteInput
                    name={`${name}.${index}.usuarioId`}
                    label="Usuario asignado"
                    searchOptions={searchUsers}
                    initialOptions={initialUser}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={7}>
                  <CustomInputText
                    name={`${name}.${index}.descripcion`}
                    label="Descripción de la tarea"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={1}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <IconButton
                    color="error"
                    onClick={() => remove(index)}
                    aria-label="Eliminar tarea"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            {fields.length > 0 && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddTarea}
                >
                  Agregar Otra Tarea
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      {/* Mostrar error general del array si existe */}
      {errors[name] &&
        typeof errors[name] === "object" &&
        "message" in errors[name] && (
          <Grid item xs={12}>
            <FormHelperText error>
              {(errors[name] as { message: string }).message}
            </FormHelperText>
          </Grid>
        )}
    </>
  );
};

export default TareasAdministrativas;
