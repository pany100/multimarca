"use client";

import authFetch from "@/utils/authFetch";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  autoId: yup.string().required("Debe seleccionar un auto"),
});

type OrdenReparacion = {
  autoId: string | number;
};

const NuevaOrdenReparacionForm = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [autocompleteOptions, setAutocompleteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [ordenReparacion, setOrdenReparacion] = useState<OrdenReparacion>({
    autoId: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const debouncedSearch = debounce(
    async (
      query: string,
      callback: (options: { value: string; label: string }[]) => void
    ) => {
      const response = await authFetch(
        `/api/autos?query=${query}&limit=10&page=0`
      );
      const data = await response.json();

      const opciones = data.items.map(
        (auto: {
          patent: string;
          id: number;
          brand: string;
          model: string;
        }) => ({
          label: `${auto.patent} - ${auto.brand || ""} ${auto.model || ""}`,
          value: auto.id.toString(),
        })
      );
      callback(opciones);
    },
    300
  );

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/orden-reparacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Orden de reparación creada con éxito",
          severity: "success",
        });
        // Aquí puedes agregar lógica adicional, como redireccionar
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la orden de reparación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: "Error al realizar la solicitud de creación",
        severity: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="autoId"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            options={autocompleteOptions || []}
            getOptionLabel={(option) => option?.label || ""}
            value={
              value
                ? autocompleteOptions.find(
                    (option) => option.value === value
                  ) || null
                : null
            }
            onChange={(_, newValue) => {
              onChange(newValue?.value || null);
              setOrdenReparacion({
                ...ordenReparacion,
                autoId: newValue?.value || "",
              });
            }}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                console.log("Input change", newInputValue);
                debouncedSearch(
                  newInputValue,
                  (options: { value: string; label: string }[]) =>
                    setAutocompleteOptions(options)
                );
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Auto"
                error={!!errors.autoId}
                helperText={errors.autoId?.message as string}
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            loadingText="Buscando..."
            noOptionsText="No se encontraron resultados"
            sx={{
              marginBottom: 2,
            }}
          />
        )}
      />
      <Button type="submit" variant="contained" color="primary">
        Crear Orden de Reparación
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </form>
  );
};

const NuevaOrdenReparacionPage = () => {
  const router = useRouter();

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nueva Orden de Reparación
        </Typography>

        <NuevaOrdenReparacionForm />

        <Typography
          variant="body2"
          component="p"
          sx={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "primary.main",
          }}
          onClick={() => router.back()}
        >
          Volver a la lista de órdenes
        </Typography>
      </Paper>
    </Box>
  );
};

export default NuevaOrdenReparacionPage;
