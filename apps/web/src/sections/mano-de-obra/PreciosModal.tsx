import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Box,
  Button,
  Modal,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

type TabType = "aumento" | "descuento";

function PreciosModal({
  setRefreshTrigger,
}: {
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [tab, setTab] = useState<TabType>("aumento");
  const [porcentaje, setPorcentaje] = useState("");
  const { authFetch } = useFetch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handlePorcentajeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
      setPorcentaje(value);
    }
  };

  const handleUpdatePrices = async () => {
    if (!porcentaje) return;

    try {
      const response = await authFetch(
        `/api/mano-de-obra/update-all?type=${tab}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ porcentaje: parseFloat(porcentaje) }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Precios de mano de obra actualizados con éxito",
          severity: "success",
        });
        setOpenModal(false);
        setPorcentaje("");
        setRefreshTrigger && setRefreshTrigger((prev) => prev + 1);
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
    <Box>
      <Box sx={{ width: "100%", mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          color="primary"
        >
          Remarcar precios
        </Button>
      </Box>
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
          <Tabs
            value={tab}
            onChange={(_, v: TabType) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label="Aumento" value="aumento" />
            <Tab label="Descuento" value="descuento" />
          </Tabs>
          <TextField
            label={`Porcentaje de ${tab === "aumento" ? "aumento" : "descuento"} (%)`}
            type="text"
            value={porcentaje}
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
              disabled={!porcentaje}
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
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default PreciosModal;
