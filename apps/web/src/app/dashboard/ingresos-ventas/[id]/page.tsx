"use client";

import ChequeDetailsView from "@/components/cheques/ChequeDetailsView";
import { useFetch } from "@/contexts/FetchContext";
import useRecibo from "@/hooks/useRecibo";
import RecibosModal from "@/sections/ingresos-reparacion/RecibosModal";
import { CHEQUE_OPERACION_IDS } from "@/utils/chequeUtils";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="overline"
    sx={{
      color: "text.secondary",
      letterSpacing: 1,
      fontWeight: 600,
    }}
  >
    {children}
  </Typography>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", flexDirection: "column" }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {children}
    </Typography>
  </Box>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: 2,
      "& > *": { flex: 1, minWidth: 0 },
    }}
  >
    {children}
  </Box>
);

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
  badge,
  sub,
}: {
  label: string;
  amount: string;
  sign?: "+" | "-";
  color?: string;
  badge?: string;
  sub?: string;
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

export default function VerPagoVentaPage({
  params,
}: {
  params: { id: string };
}) {
  const { authFetch } = useFetch();
  const { generateReciboVentas } = useRecibo();
  const id = parseInt(params.id);
  const [pago, setPago] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [reciboLoading, setReciboLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/api/ingresos-ventas/${id}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(body?.error || "No se pudo cargar el pago");
          return;
        }
        setPago(body);
      } catch {
        if (!cancelled) setError("Error de red al cargar el pago");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch, id]);

  const handleGenerarRecibo = async () => {
    if (!pago) return;
    setReciboLoading(true);
    try {
      const url = await generateReciboVentas({ id: String(id) });
      setPdfUrl(`${url}#zoom=100`);
      setReciboModalOpen(true);
    } catch {
      setSnackbar({
        open: true,
        message: "Error al generar el recibo",
        severity: "error",
      });
    } finally {
      setReciboLoading(false);
    }
  };

  const tipoOperacionId = pago?.tipoOperacionId as number | undefined;
  const hasCheque =
    typeof tipoOperacionId === "number" &&
    CHEQUE_OPERACION_IDS.includes(tipoOperacionId) &&
    !!pago?.chequeId;

  const venta = pago?.venta;
  const clienteNombre =
    pago?.cliente?.fullName ?? pago?.informacionCliente ?? "Sin cliente";

  const otrosPagos = venta?.otrosPagos ?? [];
  const ajustesEfectivos = venta?.ajustesConMontoEfectivo ?? [];
  const porcentajePagado =
    venta && venta.totalAPagar > 0
      ? Math.min((venta.totalPagado / venta.totalAPagar) * 100, 100)
      : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Button
          component={Link}
          href="/dashboard/ingresos-ventas"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
        {pago && !error && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={
                reciboLoading ? <CircularProgress size={18} /> : <SendIcon />
              }
              onClick={handleGenerarRecibo}
              disabled={reciboLoading}
            >
              Generar Recibo
            </Button>
            <Button
              component={Link}
              href={`/dashboard/ingresos-ventas/${id}/editar`}
              startIcon={<EditIcon />}
              variant="contained"
            >
              Editar
            </Button>
          </Stack>
        )}
      </Box>

      <Card>
        <CardHeader
          title={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <span>Pago #{id}</span>
              {pago && (
                <>
                  <Chip
                    label={pago.moneda}
                    color={pago.moneda === "Dolar" ? "success" : "warning"}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={
                      pago.reciboEnviado
                        ? "Recibo Enviado"
                        : "Recibo Pendiente"
                    }
                    color={pago.reciboEnviado ? "success" : "default"}
                    size="small"
                  />
                </>
              )}
            </Box>
          }
          subheader={
            pago && venta ? (
              <Typography variant="body2" color="text.secondary">
                {getFormattedDate(pago.fecha)} —{" "}
                <Link
                  href={`/dashboard/ventas/${venta.id}/ver`}
                  style={{ textDecoration: "underline", color: "inherit" }}
                >
                  Venta #{venta.id}
                </Link>{" "}
                — {clienteNombre}
              </Typography>
            ) : (
              "Detalle del pago"
            )
          }
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && !pago && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!error && pago && (
            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <SectionTitle>Información del pago</SectionTitle>
                <Field label="Tipo de Operación">
                  {pago.tipoOperacion?.label || "No especificado"}
                </Field>
                <Row>
                  <Field label="Monto">
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {getFormattedPrice(pago.monto)}
                      <Chip
                        label={pago.moneda}
                        color={
                          pago.moneda === "Dolar" ? "success" : "warning"
                        }
                        size="small"
                      />
                    </Box>
                  </Field>
                  {pago.cotizacionDolar != null && (
                    <Field label="Cotización">
                      {`${getFormattedPrice(pago.cotizacionDolar)} ARS / USD`}
                    </Field>
                  )}
                  <Field label="Fecha">{getFormattedDate(pago.fecha)}</Field>
                </Row>
                <Field label="Descripción">
                  <Box
                    component="span"
                    sx={{ whiteSpace: "pre-wrap", fontWeight: 400 }}
                  >
                    {pago.descripcion || "Sin descripción"}
                  </Box>
                </Field>
              </Stack>

              {hasCheque && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <SectionTitle>Cheque asociado</SectionTitle>
                    <ChequeDetailsView chequeId={pago.chequeId} />
                  </Stack>
                </>
              )}

              <Divider />

              <Stack spacing={1.5}>
                <SectionTitle>Cargos bancarios</SectionTitle>
                <Row>
                  <Field label="Gastos Bancarios">
                    {getFormattedPrice(pago.gastosBancarios ?? 0)}
                  </Field>
                  <Field label="Gastos ARBA">
                    {getFormattedPrice(pago.gastosArba ?? 0)}
                  </Field>
                </Row>
              </Stack>

              {venta && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <SectionTitle>Detalle de la Venta #{venta.id}</SectionTitle>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <LineItem
                        label="Repuestos"
                        amount={fmt(venta.totalRepuestos)}
                      />
                      <LineItem
                        label="Reparaciones de terceros"
                        amount={fmt(venta.totalTerceros)}
                      />
                      <LineItem
                        label="Mano de obra"
                        amount={fmt(venta.totalManoDeObra)}
                      />

                      {ajustesEfectivos.length > 0 && (
                        <>
                          <Divider sx={{ my: 0.5 }} />
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
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
                              color={
                                a.esDescuento ? "error.main" : "success.main"
                              }
                              badge={a.esInterno ? "Oculto" : undefined}
                            />
                          ))}
                        </>
                      )}

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

                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mt: 1 }}
                    >
                      Pagos realizados
                    </Typography>

                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Pago</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell align="right">Monto</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow
                          sx={{ backgroundColor: "action.selected" }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              #{pago.id} (este pago)
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getFormattedDate(pago.fecha)}
                          </TableCell>
                          <TableCell>
                            {pago.tipoOperacion?.label || "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {getFormattedPrice(pago.monto)}
                              {pago.moneda === "Dolar" && (
                                <Chip
                                  label="USD"
                                  size="small"
                                  color="success"
                                  sx={{
                                    ml: 0.5,
                                    height: 18,
                                    fontSize: "0.65rem",
                                  }}
                                />
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {otrosPagos.map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <Link
                                href={`/dashboard/ingresos-ventas/${p.id}`}
                                style={{ textDecoration: "underline" }}
                              >
                                #{p.id}
                              </Link>
                            </TableCell>
                            <TableCell>{getFormattedDate(p.fecha)}</TableCell>
                            <TableCell>{p.tipoOperacion}</TableCell>
                            <TableCell align="right">
                              {getFormattedPrice(p.monto)}
                              {p.moneda === "Dolar" && (
                                <Chip
                                  label="USD"
                                  size="small"
                                  color="success"
                                  sx={{
                                    ml: 0.5,
                                    height: 18,
                                    fontSize: "0.65rem",
                                  }}
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

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
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
                          color={
                            venta.deuda > 0 ? "warning.main" : "success.main"
                          }
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
                  </Stack>
                </>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {pago && (
        <RecibosModal
          modalOpen={reciboModalOpen}
          setModalOpen={setReciboModalOpen}
          pdfUrl={pdfUrl}
          selectedIngreso={{ id: String(id) }}
          setSnackbar={setSnackbar}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
