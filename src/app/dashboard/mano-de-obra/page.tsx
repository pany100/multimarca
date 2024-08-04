"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Box,
  Button,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import * as yup from "yup";

interface ManoDeObra {
  id: string;
  name: string;
  sellPrice: number;
}

const ManoDeObraPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [porcentajeAumento, setPorcentajeAumento] = useState("");
  const { authFetch } = useFetch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Trabajo", flex: 2 },
    { field: "sellPrice", headerName: "Precio de Venta", flex: 1 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre del Trabajo", type: "text" },
    { name: "sellPrice", label: "Precio de Venta", type: "number" },
  ];

  const createNewTrabajo = (): ManoDeObra => {
    return {
      id: "",
      name: "",
      sellPrice: 0,
    };
  };

  const handlePorcentajeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
      setPorcentajeAumento(value);
    }
  };

  const handleUpdatePrices = async () => {
    if (!porcentajeAumento) return;

    try {
      const response = await authFetch("/api/mano-de-obra/update-all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          porcentajeAumento: parseFloat(porcentajeAumento),
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Precios de mano de obra actualizados con éxito",
          severity: "success",
        });
        setOpenModal(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al actualizar precios",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al actualizar precios",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Box sx={{ width: "100%", mb: 2, mt: 2 }}>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Remarcar precios
        </Button>
      </Box>
      <CrudTable<ManoDeObra>
        title="Mano de Obra"
        columns={columns}
        apiEndpoint="/api/mano-de-obra"
        createNewItem={createNewTrabajo}
        refreshTrigger={refreshTrigger}
        fields={formFields}
        validationSchema={yup.object({
          name: yup.string().required("El nombre es requerido"),
          sellPrice: yup.number().required("El precio de venta es requerido"),
        })}
      />
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Remarcar precios
          </Typography>
          <TextField
            label="Porcentaje de aumento"
            type="text"
            value={porcentajeAumento}
            onChange={handlePorcentajeChange}
            inputProps={{ pattern: "^[0-9]*[.,]?[0-9]*$" }}
            fullWidth
            margin="normal"
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined">
              Descartar
            </Button>
            <Button
              onClick={handleUpdatePrices}
              variant="contained"
              disabled={!porcentajeAumento}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManoDeObraPage;
