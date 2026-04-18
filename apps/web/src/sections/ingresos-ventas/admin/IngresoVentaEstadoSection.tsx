"use client";

import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useRecibo from "@/hooks/useRecibo";
import RecibosModal from "@/sections/ingresos-reparacion/RecibosModal";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Switch,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useIngresoVenta } from "./contexts/IngresoVentaContext";

const IngresoVentaEstadoSection = () => {
  const { ingreso, setIngreso } = useIngresoVenta();
  const { setSnackbar } = useSnackbarContext();
  const { authFetch } = useFetch();
  const { generateReciboVentas } = useRecibo();

  const [pdfUrl, setPdfUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIngreso, setSelectedIngreso] = useState<{
    id: string;
  } | null>(null);
  const [reciboSnackbar, setReciboSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleToggleReciboEnviado = async () => {
    try {
      const response = await authFetch(`/api/ingresos-ventas/${ingreso.id}`, {
        method: "PATCH",
        body: JSON.stringify({ reciboEnviado: !ingreso.reciboEnviado }),
      });
      if (response.ok) {
        const updated = await response.json();
        setIngreso({ ...ingreso, reciboEnviado: updated.reciboEnviado });
        setSnackbar({
          open: true,
          message: "Estado actualizado",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar el estado",
        severity: "error",
      });
    }
  };

  const handleSendRecibo = async () => {
    try {
      const url = await generateReciboVentas({ id: ingreso.id.toString() });
      setSelectedIngreso({ id: ingreso.id.toString() });
      setPdfUrl(`${url}#zoom=100`);
      setModalOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al generar el recibo",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Estado y Recibo
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body1">Recibo enviado</Typography>
              <Switch
                checked={ingreso.reciboEnviado ?? false}
                onChange={handleToggleReciboEnviado}
              />
            </Box>
            <Chip
              label={
                ingreso.reciboEnviado ? "Recibo Enviado" : "Recibo Pendiente"
              }
              color={ingreso.reciboEnviado ? "success" : "default"}
              size="small"
            />
          </Box>

          {ingreso.chequeId && ingreso.cheque?.rechazado && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Cheque Rechazado"
                color="error"
                variant="outlined"
              />
            </Box>
          )}

          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={handleSendRecibo}
            fullWidth
          >
            Generar y Enviar Recibo
          </Button>
        </CardContent>
      </Card>

      {selectedIngreso && (
        <RecibosModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          pdfUrl={pdfUrl}
          selectedIngreso={selectedIngreso}
          setSnackbar={setReciboSnackbar}
        />
      )}
    </>
  );
};

export default IngresoVentaEstadoSection;
