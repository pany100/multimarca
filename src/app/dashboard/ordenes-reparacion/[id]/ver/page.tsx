"use client";
import OrdenClientePdf from "@/components/orden-reparacion/pdf/OrdenClientePdf";
import { OrdenMecanicoPdf } from "@/components/orden-reparacion/pdf/OrdenMecanicoPdf";
import { useFetch } from "@/contexts/FetchContext";
import {
  calcularTotalOrdenReparacion,
  calcularTotalReparacionesTerceros,
  calcularTotalRepuestos,
  getStatusColor,
} from "@/utils/ordenHelper";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BuildIcon from "@mui/icons-material/Build";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CommentIcon from "@mui/icons-material/Comment";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EngineeringIcon from "@mui/icons-material/Engineering";
import InventoryIcon from "@mui/icons-material/Inventory";
import PersonIcon from "@mui/icons-material/Person";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VerOrdenReparacionPage = ({ params }: { params: { id: string } }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

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
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const { authFetch } = useFetch();
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
  }, [params.id, authFetch]);

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
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, m: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Orden de Reparación #{ordenReparacion.id}
            </Typography>
            <Chip
              label={ordenReparacion.estado}
              color={getStatusColor(ordenReparacion.estado)}
              size="medium"
            />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h4">
              ${calcularTotalOrdenReparacion(ordenReparacion)}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              <DirectionsCarIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Información del Vehículo
            </Typography>
            <Typography>
              <strong>Marca:</strong> {ordenReparacion.auto.brand}
            </Typography>
            <Typography>
              <strong>Modelo:</strong> {ordenReparacion.auto.model}
            </Typography>
            <Typography>
              <strong>Patente:</strong> {ordenReparacion.auto.patent}
            </Typography>
            <Typography>
              <strong>Kilómetros:</strong> {ordenReparacion.kilometros}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Información del Cliente
            </Typography>
            <Typography>
              <strong>Nombre:</strong> {ordenReparacion.auto.owner.fullName}
            </Typography>
            <Typography>
              <strong>Teléfono:</strong> {ordenReparacion.auto.owner.phone}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              <CalendarTodayIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Fechas
            </Typography>
            <Typography>
              <strong>Entrada a taller:</strong>{" "}
              {new Date(
                ordenReparacion.fechaEntradaReparacion
              ).toLocaleDateString()}
            </Typography>
            <Typography>
              <strong>Salida de taller:</strong>{" "}
              {ordenReparacion.fechaSalidaReparacion
                ? new Date(
                    ordenReparacion.fechaSalidaReparacion
                  ).toLocaleDateString()
                : "N/A"}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6" gutterBottom>
            Detalles de la Reparación
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="detalles de reparación tabs"
          >
            <Tab icon={<BuildIcon />} label="Trabajos Realizados" />
            <Tab icon={<InventoryIcon />} label="Repuestos Utilizados" />
            <Tab icon={<EngineeringIcon />} label="Reparaciones de Terceros" />
            <Tab icon={<CommentIcon />} label="Observaciones" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <List>
              {ordenReparacion.trabajosRealizados.map(
                (trabajo: {
                  id: string;
                  descripcion: string;
                  precioUnitario: number;
                }) => (
                  <ListItem key={trabajo.id}>
                    <ListItemText
                      primary={trabajo.descripcion}
                      secondary={`Precio: $${trabajo.precioUnitario}`}
                    />
                  </ListItem>
                )
              )}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <List>
              {ordenReparacion.repuestosUsados.map(
                (repuesto: {
                  id: string;
                  stock: { name: string };
                  unidadesConsumidas: number;
                  precioVenta: number;
                }) => (
                  <ListItem key={repuesto.id}>
                    <ListItemText
                      primary={repuesto.stock.name}
                      secondary={`Cantidad: ${repuesto.unidadesConsumidas} - Precio: $${repuesto.precioVenta}`}
                    />
                  </ListItem>
                )
              )}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <List>
              {ordenReparacion.reparacionesDeTercero.map(
                (reparacion: {
                  id: string;
                  nombre: string;
                  proveedor: { name: string };
                }) => (
                  <ListItem key={reparacion.id}>
                    <ListItemText
                      primary={reparacion.nombre}
                      secondary={`Proveedor: ${reparacion.proveedor.name}`}
                    />
                  </ListItem>
                )
              )}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="subtitle2" gutterBottom>
              Observaciones del Cliente:
            </Typography>
            <Typography paragraph>
              {ordenReparacion.observacionesCliente}
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Observaciones de Entrada:
            </Typography>
            <Typography paragraph>
              {JSON.parse(ordenReparacion.observacionesEntrada).join(", ")}
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Observaciones de Salida:
            </Typography>
            <Typography paragraph>
              {JSON.parse(ordenReparacion.observacionesSalida).join(", ")}
            </Typography>
          </TabPanel>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          <AttachMoneyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Facturación Detallada
        </Typography>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Concepto</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Repuestos</TableCell>
                <TableCell align="right">
                  ${calcularTotalRepuestos(ordenReparacion)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Reparaciones de Terceros</TableCell>
                <TableCell align="right">
                  ${calcularTotalReparacionesTerceros(ordenReparacion)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mano de Obra</TableCell>
                <TableCell align="right">
                  ${ordenReparacion.manoDeObra}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    ${calcularTotalOrdenReparacion(ordenReparacion)}
                  </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          <BuildCircleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Controles en Reparación
        </Typography>
        <Grid container spacing={2}>
          {ordenReparacion.controlesEnReparacion
            .filter(
              (control: { controlMecanico: { type: string } }) =>
                control.controlMecanico.type === "checkbox"
            )
            .map(
              (control: {
                id: string;
                controlMecanico: { name: string };
                valor: string;
              }) => (
                <Grid item xs={12} sm={6} md={4} key={control.id}>
                  <Box display="flex" alignItems="center">
                    <Checkbox
                      checked={control.valor === "true"}
                      disabled
                      sx={{ mr: 1 }}
                    />
                    <Typography>{control.controlMecanico.name}</Typography>
                  </Box>
                </Grid>
              )
            )}
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {ordenReparacion.controlesEnReparacion
            .filter(
              (control: { controlMecanico: { type: string } }) =>
                control.controlMecanico.type !== "checkbox"
            )
            .map(
              (control: {
                id: string;
                controlMecanico: { name: string };
                valor: string;
              }) => (
                <Grid item xs={12} sm={6} md={4} key={control.id}>
                  <TextField
                    label={control.controlMecanico.name}
                    value={control.valor || ""}
                    fullWidth
                    disabled
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )
            )}
        </Grid>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          <EngineeringIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Mecánicos Asignados
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {ordenReparacion.mecanicos.map(
            (mecanico: { id: string; name: string }) => (
              <Chip
                key={mecanico.id}
                avatar={<Avatar alt={mecanico.name} />}
                label={mecanico.name}
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            )
          )}
        </Box>

        <Grid item container xs={12} spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMechanicOrderPrint}
              startIcon={<PrintIcon />}
            >
              Imprimir orden para el mecánico
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClientOrderPrint}
              startIcon={<PrintIcon />}
              fullWidth
              sx={{ height: "100%" }}
            >
              Imprimir orden para el cliente
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenConfirmModal}
              startIcon={<WhatsAppIcon />}
            >
              Enviar orden por WhatsApp al cliente
            </Button>
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
      <div style={{ display: "none" }}>
        {ordenReparacion !== null && (
          <OrdenMecanicoPdf ref={mechanicOrderRef} repair={ordenReparacion} />
        )}
        {ordenReparacion !== null && (
          <OrdenClientePdf ref={clientOrderRef} repair={ordenReparacion} />
        )}
      </div>
    </Box>
  );
};

export default VerOrdenReparacionPage;
