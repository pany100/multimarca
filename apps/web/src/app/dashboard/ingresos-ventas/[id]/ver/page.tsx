"use client";

import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import useRecibo from "@/hooks/useRecibo";
import RecibosModal from "@/sections/ingresos-reparacion/RecibosModal";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VerIngresoVentaPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const { authFetch } = useFetch();
  const { generateReciboVentas } = useRecibo();

  const [ingreso, setIngreso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIngreso, setSelectedIngreso] = useState<{ id: string } | null>(
    null
  );
  const [pdfUrl, setPdfUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Check permissions
  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Ventas") && !permisos.includes("Ingresos")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  // Fetch ingreso data
  useEffect(() => {
    const fetchIngreso = async () => {
      try {
        const response = await authFetch(`/api/ingresos-ventas/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setIngreso(data);
        } else {
          console.error("Error al obtener el ingreso");
        }
      } catch (error) {
        console.error("Error al obtener el ingreso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngreso();
  }, [params.id, authFetch]);

  const handleSendRecibo = async () => {
    try {
      const url = await generateReciboVentas({ id: params.id });
      setSelectedIngreso({ id: params.id });
      setPdfUrl(`${url}#zoom=100`);
      setModalOpen(true);
    } catch (error) {
      console.error("Error al generar el recibo:", error);
      setSnackbar({
        open: true,
        message: "Error al generar el recibo",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        mb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
            onClick={() => router.back()}
          >
            Volver
          </Button>
          <Typography variant="h5" component="h1">
            Ingreso por Venta #{ingreso.id}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleSendRecibo}
        >
          Enviar Recibo
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Basic Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Fecha
          </Typography>
          <Typography variant="body1">
            {getFormattedDate(ingreso.fecha)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Monto
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
          >
            {getFormattedPrice(ingreso.monto)}{" "}
            <Chip
              label={ingreso.moneda}
              color={ingreso.moneda === "Dolar" ? "success" : "warning"}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Gastos Bancarios
          </Typography>
          <Typography variant="body1">
            {getFormattedPrice(ingreso.gastosBancarios)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Cliente
          </Typography>
          <Typography variant="body1">
            {ingreso.cliente?.fullName ||
              ingreso.informacionCliente ||
              "No especificado"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Tipo de Operación
          </Typography>
          <Typography variant="body1">
            {ingreso.tipoOperacion?.label &&
            ingreso.tipoOperacion.label === "Cheque" &&
            ingreso.chequeId ? (
              <Link
                href={`/dashboard/cheques/${ingreso.chequeId}`}
                style={{ textDecoration: "underline" }}
              >
                Cheque {ingreso.cheque?.rechazado ? "(Rechazado, revisar)" : ""}
              </Link>
            ) : (
              ingreso.tipoOperacion?.label || "No especificado"
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Descripción
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
              mt: 1,
              whiteSpace: "pre-wrap",
            }}
          >
            <Typography variant="body1">
              {ingreso.descripcion || "Sin descripción"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Venta Related Info */}
      <Typography variant="h6" gutterBottom>
        Información de la Venta
      </Typography>

      {ingreso.venta ? (
        <Box sx={{ mt: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Venta ID
                </Typography>
                <Typography variant="body1">
                  <Link
                    href={`/dashboard/ventas/${ingreso.venta.id}/ver`}
                    style={{ textDecoration: "underline" }}
                  >
                    Venta #{ingreso.venta.id}
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Fecha de Venta
                </Typography>
                <Typography variant="body1">
                  {getFormattedDate(ingreso.venta.fecha)}
                </Typography>
              </Grid>
              {ingreso.venta.auto && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Vehículo
                    </Typography>
                    <Typography variant="body1">
                      {ingreso.venta.auto.marca} {ingreso.venta.auto.modelo}{" "}
                      {ingreso.venta.auto.patente
                        ? `(${ingreso.venta.auto.patente})`
                        : ""}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No hay información de venta disponible
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Status Info */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Estado del Recibo
          </Typography>
          <Chip
            label={
              ingreso.reciboEnviado ? "Recibo Enviado" : "Recibo No Enviado"
            }
            color={ingreso.reciboEnviado ? "success" : "default"}
            sx={{ mt: 1 }}
          />
        </Grid>
      </Grid>

      {/* Dolar Info if applicable */}
      {ingreso.moneda === "Dolar" && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Cotización del Dólar
          </Typography>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {getFormattedPrice(ingreso.cotizacionDolar)}
            </Typography>
          </Grid>
        </>
      )}

      {selectedIngreso && (
        <RecibosModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          pdfUrl={pdfUrl}
          selectedIngreso={selectedIngreso}
          setSnackbar={setSnackbar}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default VerIngresoVentaPage;
