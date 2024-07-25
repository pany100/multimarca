"use client";
import OrdenClientePdf from "@/components/orden-reparacion/pdf/OrdenClientePdf";
import { OrdenMecanicoPdf } from "@/components/orden-reparacion/pdf/OrdenMecanicoPdf";
import authFetch from "@/utils/authFetch";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const VerOrdenReparacionPage = ({ params }: { params: { id: string } }) => {
  let mechanicOrderRef = useRef(null);
  let clientOrderRef = useRef(null);
  const [ordenReparacion, setOrdenReparacion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const handleMechanicOrderPrint = useReactToPrint({
    content: () => mechanicOrderRef.current,
  });
  const handleClientOrderPrint = useReactToPrint({
    content: () => clientOrderRef.current,
  });
  const handleOpenConfirmModal = () => {
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
  };
  const handleSendNotification = async () => {
    try {
      const response = await authFetch(
        `/api/orden-reparacion/${params.id}/send-notification`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Notificación enviada con éxito",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al enviar la notificación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      handleCloseConfirmModal();
    }
  };
  useEffect(() => {
    const fetchOrdenReparacion = async () => {
      try {
        const response = await authFetch(`/api/orden-reparacion/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrdenReparacion(data);
        } else {
          console.error("Error al obtener la orden de reparación");
        }
      } catch (error) {
        console.error("Error al obtener la orden de reparación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenReparacion();
  }, [params.id]);

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
    <>
      <div style={{ display: "none" }}>
        {ordenReparacion !== null && (
          <OrdenMecanicoPdf ref={mechanicOrderRef} repair={ordenReparacion} />
        )}
        {ordenReparacion !== null && (
          <OrdenClientePdf ref={clientOrderRef} repair={ordenReparacion} />
        )}
      </div>
      <Paper elevation={3} sx={{ p: 3, m: 2 }}>
        <Typography variant="h4" gutterBottom>
          Orden de Reparación #{ordenReparacion.id}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Información del Auto</Typography>
            <Box>
              <Typography>Marca: {ordenReparacion.auto.brand}</Typography>
              <Typography>Modelo: {ordenReparacion.auto.model}</Typography>
              <Typography>Año: {ordenReparacion.auto.year}</Typography>
              <Typography>Patente: {ordenReparacion.auto.patent}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Información del Cliente</Typography>
            <Box>
              <Typography>
                Nombre: {ordenReparacion.auto.owner.fullName}
              </Typography>
              <Typography>
                Teléfono: {ordenReparacion.auto.owner.phone}
              </Typography>
              <Typography>Email: {ordenReparacion.auto.owner.email}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Acciones</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMechanicOrderPrint}
                startIcon={<PrintIcon />}
              >
                Imprimir orden para el mecánico
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClientOrderPrint}
                startIcon={<PrintIcon />}
              >
                Imprimir orden para el cliente
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleOpenConfirmModal}
                startIcon={<WhatsAppIcon />}
              >
                Enviar orden por WhatsApp al cliente
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Detalles de la Reparación</Typography>
            <Box>
              <Typography>Estado: {ordenReparacion.estado}</Typography>
              <Typography>
                Fecha de Entrada:{" "}
                {new Date(
                  ordenReparacion.fechaEntradaReparacion
                ).toLocaleDateString()}
              </Typography>
              <Typography>
                Fecha de Salida:{" "}
                {ordenReparacion.fechaSalidaReparacion
                  ? new Date(
                      ordenReparacion.fechaSalidaReparacion
                    ).toLocaleDateString()
                  : "N/A"}
              </Typography>
              <Typography>Kilómetros: {ordenReparacion.kilometros}</Typography>
              <Typography>
                Observaciones del Cliente:{" "}
                {ordenReparacion.observacionesCliente}
              </Typography>
              <Typography>
                Observaciones de Entrada: {ordenReparacion.observacionesEntrada}
              </Typography>
              <Typography>
                Observaciones de Salida: {ordenReparacion.observacionesSalida}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Mecánicos Asignados</Typography>
            <Box>
              {ordenReparacion.mecanicos.map(
                (mecanico: { id: string; name: string }) => (
                  <Typography key={mecanico.id}>{mecanico.name}</Typography>
                )
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Repuestos Usados</Typography>
            <Box>
              {ordenReparacion.repuestosUsados.map(
                (repuesto: {
                  id: string;
                  stock: { name: string };
                  unidadesConsumidas: number;
                }) => (
                  <Typography key={repuesto.id}>
                    {repuesto.stock.name} - Cantidad:{" "}
                    {repuesto.unidadesConsumidas}
                  </Typography>
                )
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Reparaciones de Terceros</Typography>
            <Box>
              {ordenReparacion.reparacionesDeTercero.map(
                (reparacion: {
                  id: string;
                  nombre: string;
                  proveedor: { name: string };
                }) => (
                  <Typography key={reparacion.id}>
                    {reparacion.nombre} - Proveedor: {reparacion.proveedor.name}
                  </Typography>
                )
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Trabajos Realizados</Typography>
            <Box>
              {ordenReparacion.trabajosRealizados.map(
                (trabajo: {
                  id: string;
                  descripcion: string;
                  precioUnitario: number;
                }) => (
                  <Typography key={trabajo.id}>
                    {trabajo.descripcion} - Precio: ${trabajo.precioUnitario}
                  </Typography>
                )
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Controles en Reparación</Typography>
            <Box>
              {ordenReparacion.controlesEnReparacion.map(
                (control: {
                  id: string;
                  controlMecanico: { name: string; type: string };
                  valor: string;
                }) => (
                  <Box key={control.id} display="flex" alignItems="center">
                    <Typography>{control.controlMecanico.name}:</Typography>
                    {control.controlMecanico.type === "checkbox" ? (
                      <Checkbox
                        checked={Boolean(control.valor === "true")}
                        disabled
                        sx={{ ml: 1 }}
                      />
                    ) : (
                      <Typography sx={{ ml: 1 }}>{control.valor}</Typography>
                    )}
                  </Box>
                )
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Monto Total para el Cliente</Typography>
            <Typography>${ordenReparacion.montoTotalCliente}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Dialog
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Confirmar envío de notificación?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea enviar la notificación por WhatsApp al
            cliente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSendNotification} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VerOrdenReparacionPage;
