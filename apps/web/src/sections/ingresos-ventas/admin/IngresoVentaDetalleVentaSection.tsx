"use client";

import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useIngresoVenta } from "./contexts/IngresoVentaContext";

const fmt = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function LineItem({
  label,
  amount,
  sign,
  color,
  sub,
  badge,
}: {
  label: string;
  amount: string;
  sign?: "+" | "-";
  color?: string;
  sub?: string;
  badge?: string;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 0.3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {badge && (
            <Chip
              size="small"
              label={badge}
              color="warning"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: 500,
            color: color ?? "text.secondary",
            whiteSpace: "nowrap",
          }}
        >
          {sign ? `${sign} ` : ""}$ {amount}
        </Typography>
      </Box>
      {sub && (
        <Typography variant="caption" color="text.disabled" sx={{ pl: 1 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

const IngresoVentaDetalleVentaSection = () => {
  const { ingreso } = useIngresoVenta();
  const venta = ingreso.venta;

  if (!venta) return null;

  const porcentajePagado =
    venta.totalAPagar > 0
      ? Math.min((venta.totalPagado / venta.totalAPagar) * 100, 100)
      : 0;

  const otrosPagos = venta.otrosPagos ?? [];

  const hasLegacy =
    Number(venta.descuento ?? 0) > 0 || Number(venta.incremento ?? 0) > 0;

  const ajustesEfectivos = venta.ajustesConMontoEfectivo ?? [];
  const ajustesPrecio = venta.ajustesPrecio ?? [];

  const precioFinalLocal =
    Number(venta.totalTerceros ?? 0) +
    Number(venta.totalRepuestos ?? 0) +
    Number(venta.totalManoDeObra ?? 0) -
    Number(venta.descuento ?? 0) +
    Number(venta.incremento ?? 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Detalle de la Venta #{venta.id}
        </Typography>

        {/* Desglose de costos */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <LineItem label="Repuestos" amount={fmt(venta.totalRepuestos)} />
          <LineItem
            label="Reparaciones de terceros"
            amount={fmt(venta.totalTerceros)}
          />
          <LineItem label="Mano de obra" amount={fmt(venta.totalManoDeObra)} />

          {/* Legacy: descuento/incremento */}
          {hasLegacy && (
            <>
              {Number(venta.descuento ?? 0) > 0 && (
                <LineItem
                  label="Descuento"
                  amount={fmt(venta.descuento)}
                  sign="-"
                  color="error.main"
                  sub={venta.descripcionDescuento || undefined}
                  badge="Deprecado"
                />
              )}
              {Number(venta.incremento ?? 0) > 0 && (
                <LineItem
                  label="Incremento"
                  amount={fmt(venta.incremento)}
                  sign="+"
                  color="success.main"
                  sub={venta.descripcionIncremento || undefined}
                  badge="Deprecado"
                />
              )}
            </>
          )}

          {/* Precio Final Local (base + legacy, antes de ajustes nuevos) */}
          {(ajustesPrecio.length > 0 || hasLegacy) && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.3,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  Precio Final Local
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  $ {fmt(precioFinalLocal)}
                </Typography>
              </Box>
            </>
          )}

          {/* Ajustes nuevos */}
          {ajustesEfectivos.length > 0 && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                sx={{ mb: 0.25 }}
              >
                Ajustes
              </Typography>
              {ajustesEfectivos.map((a: any, idx: number) => (
                <LineItem
                  key={idx}
                  label={
                    a.tipo === "porcentual"
                      ? `${a.descripcion} (${Number(a.montoOriginal)}%)`
                      : a.descripcion
                  }
                  amount={fmt(Math.abs(a.montoEfectivo))}
                  sign={a.esDescuento ? "-" : "+"}
                  color={a.esDescuento ? "error.main" : "success.main"}
                  badge={a.esInterno ? "Oculto" : undefined}
                />
              ))}
            </>
          )}

          {/* Total */}
          <Divider sx={{ my: 0.5 }} />
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              backgroundColor: "primary.lighter",
              borderRadius: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary.dark"
              >
                Total Venta
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary.dark"
                sx={{ fontFamily: "monospace" }}
              >
                $ {fmt(venta.totalAPagar)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Resumen de pagos */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          Pagos realizados
        </Typography>

        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Pago</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Pago actual (resaltado) */}
            <TableRow
              sx={{ backgroundColor: "action.selected", fontWeight: "bold" }}
            >
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  #{ingreso.id} (este pago)
                </Typography>
              </TableCell>
              <TableCell>{getFormattedDate(ingreso.fecha)}</TableCell>
              <TableCell>{ingreso.tipoOperacion?.label || "N/A"}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">
                  {getFormattedPrice(ingreso.monto)}
                  {ingreso.moneda === "Dolar" && (
                    <Chip
                      label="USD"
                      size="small"
                      color="success"
                      sx={{ ml: 0.5, height: 18, fontSize: "0.65rem" }}
                    />
                  )}
                </Typography>
              </TableCell>
            </TableRow>

            {/* Otros pagos */}
            {otrosPagos.map((pago: any) => (
              <TableRow key={pago.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/ingresos-ventas/${pago.id}`}
                    style={{ textDecoration: "underline" }}
                  >
                    #{pago.id}
                  </Link>
                </TableCell>
                <TableCell>{getFormattedDate(pago.fecha)}</TableCell>
                <TableCell>{pago.tipoOperacion}</TableCell>
                <TableCell align="right">
                  {getFormattedPrice(pago.monto)}
                  {pago.moneda === "Dolar" && (
                    <Chip
                      label="USD"
                      size="small"
                      color="success"
                      sx={{ ml: 0.5, height: 18, fontSize: "0.65rem" }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}

            {otrosPagos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No hay otros pagos registrados
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Balance */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total pagado
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color="success.main"
              sx={{ fontFamily: "monospace" }}
            >
              $ {fmt(venta.totalPagado)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Deuda pendiente
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={venta.deuda > 0 ? "warning.main" : "success.main"}
              sx={{ fontFamily: "monospace" }}
            >
              $ {fmt(venta.deuda)}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Progreso de pago
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {porcentajePagado.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={porcentajePagado}
              color={venta.deuda <= 0 ? "success" : "primary"}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": { borderRadius: 4 },
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IngresoVentaDetalleVentaSection;
