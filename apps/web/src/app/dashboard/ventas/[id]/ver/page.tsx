"use client";

import { useFetch } from "@/contexts/FetchContext";
import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";
import { useAuth } from "@/hooks/useAuth";
import {
  getFormattedDate,
  getFormattedPrice,
  getFormattedPriceDolar,
} from "@/utils/fieldHelper";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
// Header component for displaying venta basic info
const VentaHeader = ({ venta }: { venta: any }) => {
  const [printLoading, setPrintLoading] = useState(false);
  const { generatePdf } = useGeneratePdf({
    onError: () => {
      console.error("Error al generar el PDF de la venta");
      setPrintLoading(false);
    },
    printDirectly: true,
  });

  const handlePrintVenta = async () => {
    setPrintLoading(true);
    try {
      await generatePdf(`/api/ventas/${venta.id}/pdf-completo`);
    } finally {
      setPrintLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Box>
        <Typography variant="h4" gutterBottom>
          Venta #{venta.id}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Fecha: {getFormattedDate(venta.fecha)}
        </Typography>
        {venta.cliente && (
          <Typography variant="subtitle1">
            Cliente: {venta.cliente.fullName}
          </Typography>
        )}
        {venta.presupuesto && (
          <Typography
            variant="subtitle1"
            sx={{ color: "warning.main", fontWeight: "bold" }}
          >
            PRESUPUESTO
          </Typography>
        )}
      </Box>
      <Tooltip title="Imprimir venta">
        <Button
          variant="outlined"
          color="primary"
          startIcon={
            printLoading ? <CircularProgress size={20} /> : <PrintIcon />
          }
          onClick={handlePrintVenta}
          disabled={printLoading}
        >
          Imprimir
        </Button>
      </Tooltip>
    </Box>
  );
};

// Component for displaying repuestos used
const RepuestosUsados = ({ venta }: { venta: any }) => {
  if (!venta.repuestosUsados || venta.repuestosUsados.length === 0) {
    return (
      <Box>
        <Typography variant="h6">Repuestos Usados</Typography>
        <Typography variant="body2" color="text.secondary">
          No hay repuestos usados registrados
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Repuestos Usados
      </Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Box component="th" sx={{ p: 1, textAlign: "left" }}>
              Repuesto
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "right" }}>
              Cantidad
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "right" }}>
              Subtotal
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "right" }}>
              Subtotal ({venta.porcentajeRecargo}% de recargo)
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {venta.repuestosUsados.map((repuesto: any) => (
            <Box
              component="tr"
              key={repuesto.id}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Box component="td" sx={{ p: 1 }}>
                {repuesto.stock.name}
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                {repuesto.unidadesConsumidas}
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                ${Number(repuesto.precioVenta).toLocaleString("es-AR")}
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                ${Number(repuesto.precioVenta).toLocaleString("es-AR")}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Component for displaying reparaciones de terceros
const ReparacionesTerceros = ({ venta }: { venta: any }) => {
  if (
    !venta.reparacionesDeTercero ||
    venta.reparacionesDeTercero.length === 0
  ) {
    return (
      <Box>
        <Typography variant="h6">Reparaciones de Terceros</Typography>
        <Typography variant="body2" color="text.secondary">
          No hay reparaciones de terceros registradas
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reparaciones de Terceros
      </Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Box component="th" sx={{ p: 1, textAlign: "left" }}>
              Nombre
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "left" }}>
              Proveedor
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "left" }}>
              Recibo
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "right" }}>
              Precio
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "right" }}>
              Precio ({venta.porcentajeRecargo}% de recargo)
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {venta.reparacionesDeTercero.map((reparacion: any) => (
            <Box
              component="tr"
              key={reparacion.id}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Box component="td" sx={{ p: 1 }}>
                {reparacion.nombre}
              </Box>
              <Box component="td" sx={{ p: 1 }}>
                {reparacion.proveedor?.name || "N/A"}
              </Box>
              <Box component="td" sx={{ p: 1 }}>
                {reparacion.recibo ? (
                  <Link href={reparacion.recibo} target="_blank">
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<ReceiptIcon />}
                    >
                      Ver recibo
                    </Button>
                  </Link>
                ) : (
                  "N/A"
                )}
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                {getFormattedPrice(reparacion.precioVenta)}
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                {getFormattedPrice(reparacion.precioVenta)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Component for displaying trabajos realizados
const TrabajosRealizados = ({ venta }: { venta: any }) => {
  if (!venta.trabajosRealizados || venta.trabajosRealizados.length === 0) {
    return (
      <Box>
        <Typography variant="h6">Trabajos Realizados</Typography>
        <Typography variant="body2" color="text.secondary">
          No hay trabajos realizados registrados
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trabajos Realizados
      </Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Box component="th" sx={{ p: 1, textAlign: "left" }}>
              Descripción
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "right" }}>
              Precio
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {venta.trabajosRealizados.map((trabajo: any) => (
            <Box
              component="tr"
              key={trabajo.id}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Box component="td" sx={{ p: 1 }}>
                {trabajo.descripcion}
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                {getFormattedPrice(trabajo.precioUnitario)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Component for displaying price information
const PrecioInfo = ({ venta }: { venta: any }) => {
  const totalBase = venta.totalBase;
  const total = venta.total;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Información final
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="tbody">
            <Box component="tr">
              <Box component="td" sx={{ p: 1, fontWeight: "bold" }}>
                Subtotal:
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                {getFormattedPrice(totalBase)}
              </Box>
            </Box>
            {Number(venta.descuento) > 0 && (
              <>
                <Box component="tr">
                  <Box component="td" sx={{ p: 1, fontWeight: "bold" }}>
                    Descuento:
                  </Box>
                  <Box
                    component="td"
                    sx={{ p: 1, textAlign: "right", color: "error.main" }}
                  >
                    -{getFormattedPrice(venta.descuento)}
                  </Box>
                </Box>
                {venta.descripcionDescuento && (
                  <Box component="tr">
                    <Box
                      component="td"
                      sx={{
                        p: 1,
                        pl: 3,
                        fontSize: "0.875rem",
                        color: "text.secondary",
                      }}
                      colSpan={2}
                    >
                      {venta.descripcionDescuento}
                    </Box>
                  </Box>
                )}
              </>
            )}
            {Number(venta.incremento) > 0 && (
              <>
                <Box component="tr">
                  <Box component="td" sx={{ p: 1, fontWeight: "bold" }}>
                    Incremento:
                  </Box>
                  <Box
                    component="td"
                    sx={{ p: 1, textAlign: "right", color: "success.main" }}
                  >
                    +{getFormattedPrice(venta.incremento)}
                  </Box>
                </Box>
                {venta.descripcionIncremento && (
                  <Box component="tr">
                    <Box
                      component="td"
                      sx={{
                        p: 1,
                        pl: 3,
                        fontSize: "0.875rem",
                        color: "text.secondary",
                      }}
                      colSpan={2}
                    >
                      {venta.descripcionIncremento}
                    </Box>
                  </Box>
                )}
              </>
            )}
            <Box component="tr" sx={{ borderTop: 1, borderColor: "divider" }}>
              <Box component="td" sx={{ p: 1, fontWeight: "bold" }}>
                Total:
              </Box>
              <Box
                component="td"
                sx={{ p: 1, textAlign: "right", fontWeight: "bold" }}
              >
                {getFormattedPrice(total)}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const PagosInfo = ({ venta }: { venta: any }) => {
  const total = venta.total;
  const totalPagos = venta.totalPagos;
  console.log(venta);
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pagos
      </Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Box component="th" sx={{ p: 1, textAlign: "left" }}>
              Fecha
            </Box>
            <Box component="th" sx={{ p: 1, textAlign: "right" }}>
              Monto
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {venta.ingresos.map((ingreso: any) => (
            <Box
              component="tr"
              key={ingreso.id}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Box component="td" sx={{ p: 1 }}>
                {getFormattedDate(ingreso.fecha)}
              </Box>
              <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                {ingreso.moneda === "Dolar"
                  ? getFormattedPriceDolar(ingreso.monto)
                  : getFormattedPrice(ingreso.monto)}
              </Box>
            </Box>
          ))}
        </Box>
        <Box component="tr" sx={{ borderTop: 1, borderColor: "divider" }}>
          <Box component="td" sx={{ p: 1, fontWeight: "bold" }}>
            Total Pagos (en pesos):
          </Box>
          <Box
            component="td"
            sx={{ p: 1, textAlign: "right", fontWeight: "bold" }}
          >
            {getFormattedPrice(totalPagos)}
          </Box>
        </Box>
        <Box
          component="tr"
          sx={{
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: totalPagos > total ? "#e6f7e6" : "#efb6a9",
          }}
        >
          <Box component="td" sx={{ p: 1, fontWeight: "bold" }}>
            {totalPagos > total ? "A favor" : "Falta"}
          </Box>
          <Box
            component="td"
            sx={{ p: 1, textAlign: "right", fontWeight: "bold" }}
          >
            {getFormattedPrice(
              totalPagos > total ? totalPagos - total : total - totalPagos
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const VerVentaPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Ventas")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchVenta = async () => {
      try {
        const response = await authFetch(`/api/ventas/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setVenta(data);
        } else {
          console.error("Error al obtener la venta");
        }
      } catch (error) {
        console.error("Error al obtener la venta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenta();
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
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        mb: 3,
      }}
    >
      <VentaHeader venta={venta} />
      <Divider sx={{ my: 3 }} />
      <RepuestosUsados venta={venta} />
      <Divider sx={{ my: 2 }} />
      <ReparacionesTerceros venta={venta} />
      <Divider sx={{ my: 2 }} />
      <TrabajosRealizados venta={venta} />
      <Divider sx={{ my: 2 }} />
      <PrecioInfo venta={venta} />
      <Divider sx={{ my: 2 }} />
      <PagosInfo venta={venta} />
    </Paper>
  );
};

export default VerVentaPage;
