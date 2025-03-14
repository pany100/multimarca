"use client";
import { getFormattedPrice } from "@/utils/fieldHelper";
import BuildIcon from "@mui/icons-material/Build";
import CommentIcon from "@mui/icons-material/Comment";
import EngineeringIcon from "@mui/icons-material/Engineering";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  Box,
  Button,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

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
      id={`repair-tabpanel-${index}`}
      aria-labelledby={`repair-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Helper function to safely parse JSON arrays
const safeParseArray = (jsonString: string | null | undefined): string[] => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch (e) {
    console.error("Error parsing JSON string:", e);
    return [];
  }
};

function Details({ ordenReparacion }: { ordenReparacion: any }) {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Safely extract and format data
  const trabajosRealizados = ordenReparacion?.trabajosRealizados || [];
  const repuestosUsados = ordenReparacion?.repuestosUsados || [];
  const reparacionesDeTercero = ordenReparacion?.reparacionesDeTercero || [];
  const observacionesCliente = ordenReparacion?.observacionesCliente || "";
  const observacionesEntrada = safeParseArray(
    ordenReparacion?.observacionesEntrada
  );
  const observacionesSalida = safeParseArray(
    ordenReparacion?.observacionesSalida
  );

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <BuildIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Detalles de la Reparación
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="detalles de reparación"
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : undefined}
        allowScrollButtonsMobile
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            minHeight: { xs: "72px", sm: "48px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          },
        }}
      >
        <Tab
          icon={<BuildIcon />}
          label="TRABAJOS REALIZADOS"
          id="repair-tab-0"
          aria-controls="repair-tabpanel-0"
          sx={{
            flexDirection: isMobile ? "column" : "row",
            gap: 1,
            textTransform: "uppercase",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          icon={<InventoryIcon />}
          label="REPUESTOS UTILIZADOS"
          id="repair-tab-1"
          aria-controls="repair-tabpanel-1"
          sx={{
            flexDirection: isMobile ? "column" : "row",
            gap: 1,
            textTransform: "uppercase",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          icon={<EngineeringIcon />}
          label="REPARACIÓN / REPUESTOS DE TERCEROS"
          id="repair-tab-2"
          aria-controls="repair-tabpanel-2"
          sx={{
            flexDirection: isMobile ? "column" : "row",
            gap: 1,
            textTransform: "uppercase",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          icon={<CommentIcon />}
          label="OBSERVACIONES"
          id="repair-tab-3"
          aria-controls="repair-tabpanel-3"
          sx={{
            flexDirection: isMobile ? "column" : "row",
            gap: 1,
            textTransform: "uppercase",
            fontSize: "0.75rem",
          }}
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {trabajosRealizados.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 500 }}>Descripción</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    Precio
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trabajosRealizados.map(
                  (
                    trabajo: {
                      id: string;
                      descripcion: string;
                      precioUnitario: number;
                    },
                    index: number
                  ) => (
                    <TableRow key={trabajo.id || index}>
                      <TableCell component="th" scope="row">
                        {trabajo.descripcion || "Sin descripción"}
                      </TableCell>
                      <TableCell align="right">
                        {getFormattedPrice(trabajo.precioUnitario)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay trabajos realizados registrados.
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {repuestosUsados.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 500 }}>Repuesto</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Cantidad</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    Precio
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repuestosUsados.map(
                  (
                    repuesto: {
                      id: string;
                      stock: { name: string };
                      unidadesConsumidas: number;
                      precioVenta: number;
                    },
                    index: number
                  ) => (
                    <TableRow key={repuesto.id || index}>
                      <TableCell component="th" scope="row">
                        {repuesto.stock?.name || "Sin nombre"}
                      </TableCell>
                      <TableCell>{repuesto.unidadesConsumidas || 0}</TableCell>
                      <TableCell align="right">
                        {getFormattedPrice(repuesto.precioVenta)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay repuestos utilizados registrados.
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {reparacionesDeTercero.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 500 }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Proveedor</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    Precio de compra
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    Precio de venta
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reparacionesDeTercero.map(
                  (
                    reparacion: {
                      id: string;
                      nombre: string;
                      proveedor: { name: string };
                      precioCompra: string | number;
                      precioVenta: string | number;
                      recibo: string;
                    },
                    index: number
                  ) => (
                    <TableRow key={reparacion.id || index}>
                      <TableCell component="th" scope="row">
                        {reparacion.nombre || "Sin nombre"}
                      </TableCell>
                      <TableCell>
                        {reparacion.proveedor?.name || "Sin proveedor"}
                      </TableCell>
                      <TableCell>
                        {getFormattedPrice(reparacion.precioCompra)}
                      </TableCell>
                      <TableCell>
                        {getFormattedPrice(reparacion.precioVenta)}
                      </TableCell>
                      <TableCell align="center">
                        {reparacion.recibo && (
                          <Link href={reparacion.recibo} target="_blank">
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ minWidth: "100px" }}
                            >
                              Ver recibo
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay reparaciones de terceros registradas.
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: theme.palette.background.default,
              borderRadius: "4px",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              Observaciones del Cliente:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                pl: 1,
                whiteSpace: "pre-line",
              }}
            >
              {observacionesCliente || "-"}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: theme.palette.background.default,
              borderRadius: "4px",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              Observaciones de Entrada:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                pl: 1,
                whiteSpace: "pre-line",
              }}
            >
              {observacionesEntrada.length > 0
                ? observacionesEntrada.join(", ")
                : "-"}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.default,
              borderRadius: "4px",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              Observaciones de Salida:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                pl: 1,
                whiteSpace: "pre-line",
              }}
            >
              {observacionesSalida.length > 0
                ? observacionesSalida.join(", ")
                : "-"}
            </Typography>
          </Paper>
        </Box>
      </TabPanel>
    </Paper>
  );
}

export default Details;
