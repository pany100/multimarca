"use client";
import OrdenClienteInterna from "@/components/orden-reparacion/pdf/OrdenClienteInterna";
import OrdenClientePdf from "@/components/orden-reparacion/pdf/OrdenClientePdf";
import { OrdenMecanicoPdf } from "@/components/orden-reparacion/pdf/OrdenMecanicoPdf";
import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  calcularManoDeObra,
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
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  let mechanicOrderRef = useRef(null);
  let clientOrderRef = useRef(null);
  let internClientOrderRef = useRef(null);

  const [ordenReparacion, setOrdenReparacion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Reparaciones")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);
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
  const handleInternClientOrderPrint = useReactToPrint({
    content: () => internClientOrderRef.current,
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={ordenReparacion.estado}
                color={getStatusColor(ordenReparacion.estado)}
                size="medium"
              />
              <Button
                variant="contained"
                color="info"
                component={Link}
                href={`/dashboard/ordenes-reparacion/${ordenReparacion.id}/editar`}
              >
                Editar orden
              </Button>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h4">
              {getFormattedPrice(calcularTotalOrdenReparacion(ordenReparacion))}
            </Typography>
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handleMechanicOrderPrint}
              fullWidth
            >
              Imprimir orden para el mecánico
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="warning"
              startIcon={<PrintIcon />}
              onClick={handleInternClientOrderPrint}
              fullWidth
            >
              Imprimir orden interna
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handleClientOrderPrint}
              fullWidth
            >
              Imprimir orden para el cliente
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            {ordenReparacion.estado !== "Terminado" ? (
              <Tooltip title="Solo disponible para reparaciones terminadas">
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    fullWidth
                    disabled
                  >
                    Enviar orden por WhatsApp al cliente
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                onClick={handleSendNotification}
                fullWidth
              >
                Enviar orden por WhatsApp al cliente
              </Button>
            )}
          </Grid>
        </Grid>
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
              <strong>Kilómetros:</strong>{" "}
              {ordenReparacion.kilometros?.toLocaleString("es-AR")}
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
              {ordenReparacion.fechaEntradaReparacion
                ? new Date(
                    ordenReparacion.fechaEntradaReparacion
                  ).toLocaleDateString()
                : "N/A"}
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
            <Tab
              icon={<EngineeringIcon />}
              label="Reparación / Repuestos de terceros"
            />
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
                      secondary={`Precio: ${getFormattedPrice(
                        trabajo.precioUnitario
                      )}`}
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
                      secondary={`Cantidad: ${
                        repuesto.unidadesConsumidas
                      } - Precio: ${getFormattedPrice(repuesto.precioVenta)}`}
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
                  precioCompra: string;
                  precioVenta: string;
                  recibo: string;
                }) => (
                  <ListItem key={reparacion.id}>
                    <ListItemText
                      primary={`${reparacion.nombre} - Proveedor: ${reparacion.proveedor.name}`}
                      secondary={`Precio de compra: ${getFormattedPrice(
                        reparacion.precioCompra
                      )} - Precio de venta: ${getFormattedPrice(
                        reparacion.precioVenta
                      )}`}
                    />
                    {reparacion.recibo && (
                      <Box sx={{ mr: 5 }}>
                        <Link href={reparacion.recibo} target="_blank">
                          <Button size="small" color="primary">
                            Ver recibo
                          </Button>
                        </Link>
                      </Box>
                    )}
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
              {ordenReparacion.observacionesCliente || "-"}
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Observaciones de Entrada:
            </Typography>
            <Typography paragraph>
              {JSON.parse(ordenReparacion.observacionesEntrada || "[]").join(
                ", "
              ) || "-"}
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Observaciones de Salida:
            </Typography>
            <Typography paragraph>
              {JSON.parse(ordenReparacion.observacionesSalida || "[]").join(
                ", "
              ) || "-"}
            </Typography>
          </TabPanel>
        </Box>
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
                detalle?: string;
              }) => (
                <Grid item xs={12} sm={6} key={control.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>{control.controlMecanico.name}</Typography>
                    <Checkbox
                      checked={control.valor === "true"}
                      disabled
                      edge="end"
                    />
                  </Box>
                </Grid>
              )
            )}
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
                <Grid item xs={12} key={control.id}>
                  <Typography>
                    {control.controlMecanico.name}: {control.valor || "-"}
                  </Typography>
                </Grid>
              )
            )}
          <Grid item xs={12}>
            <Typography variant="h6">Detalles:</Typography>
          </Grid>
          <List sx={{ mt: 0, py: 0 }}>
            {JSON.parse(ordenReparacion.detalleControles || "[]").map(
              (element: string, index: number) => (
                <ListItem key={index} sx={{ py: 0.0 }}>
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
                  {getFormattedPrice(calcularTotalRepuestos(ordenReparacion))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Reparaciones / Repuestos de terceros</TableCell>
                <TableCell align="right">
                  {getFormattedPrice(
                    calcularTotalReparacionesTerceros(ordenReparacion)
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mano de Obra</TableCell>
                <TableCell align="right">
                  {getFormattedPrice(
                    calcularManoDeObra(ordenReparacion.trabajosRealizados)
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Descuento
                  {ordenReparacion.descripcionDescuento && (
                    <>: {ordenReparacion.descripcionDescuento}</>
                  )}
                </TableCell>
                <TableCell align="right">
                  {getFormattedPrice(ordenReparacion.descuento)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    {getFormattedPrice(
                      calcularTotalOrdenReparacion(ordenReparacion)
                    )}
                  </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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
        {ordenReparacion !== null && (
          <OrdenClienteInterna
            ref={internClientOrderRef}
            repair={ordenReparacion}
          />
        )}
      </div>
    </Box>
  );
};

export default VerOrdenReparacionPage;
