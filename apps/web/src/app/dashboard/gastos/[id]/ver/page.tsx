"use client";

import ChequeDetailsView from "@/components/cheques/ChequeDetailsView";
import { useFetch } from "@/contexts/FetchContext";
import { CHEQUE_OPERACION_IDS } from "@/utils/chequeUtils";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
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
  Stack,
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

export default function VerGastoPage({
  params,
}: {
  params: { id: string };
}) {
  const { authFetch } = useFetch();
  const id = parseInt(params.id);
  const [gasto, setGasto] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/api/gastos/${id}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(body?.error || "No se pudo cargar el gasto");
          return;
        }
        setGasto(body);
      } catch {
        if (!cancelled) setError("Error de red al cargar el gasto");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch, id]);

  const tipoOperacionId = gasto?.tipoOperacionId as number | undefined;
  const hasCheque =
    typeof tipoOperacionId === "number" &&
    CHEQUE_OPERACION_IDS.includes(tipoOperacionId) &&
    !!gasto?.chequeId;

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
          href="/dashboard/gastos"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
        {gasto && !error && (
          <Button
            component={Link}
            href={`/dashboard/gastos/${id}/editar`}
            startIcon={<EditIcon />}
            variant="contained"
          >
            Editar
          </Button>
        )}
      </Box>

      <Card>
        <CardHeader
          title={`Gasto #${id}`}
          subheader="Detalle del gasto"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && !gasto && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!error && gasto && (
            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <SectionTitle>Fecha y categoría</SectionTitle>
                <Row>
                  <Field label="Fecha">{getFormattedDate(gasto.fecha)}</Field>
                  <Field label="Categoría">
                    {gasto.categoria?.nombre || "No especificada"}
                  </Field>
                </Row>
                {gasto.mecanico && (
                  <Field label="Empleado">
                    {gasto.mecanico.fullName ||
                      `${gasto.mecanico.firstName ?? ""} ${gasto.mecanico.lastName ?? ""}`.trim() ||
                      "—"}
                  </Field>
                )}
                {gasto.proveedor && (
                  <Field label="Proveedor">
                    {gasto.proveedor.nombre ||
                      gasto.proveedor.razonSocial ||
                      "—"}
                  </Field>
                )}
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <SectionTitle>Detalles del gasto</SectionTitle>
                <Field label="Tipo de Operación">
                  {gasto.tipoOperacion?.label || "No especificado"}
                </Field>
                <Field label="Nombre">{gasto.nombre || "—"}</Field>
                <Row>
                  <Field label="Monto">
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {getFormattedPrice(gasto.precio)}
                      <Chip
                        label={gasto.moneda}
                        color={
                          gasto.moneda === "Dolar" ? "success" : "warning"
                        }
                        size="small"
                      />
                    </Box>
                  </Field>
                  {gasto.cotizacionDolar != null && (
                    <Field label="Cotización">
                      {`${getFormattedPrice(gasto.cotizacionDolar)} ARS / USD`}
                    </Field>
                  )}
                </Row>
                <Field label="Detalle">
                  <Box
                    component="span"
                    sx={{ whiteSpace: "pre-wrap", fontWeight: 400 }}
                  >
                    {gasto.detalle || "Sin detalle"}
                  </Box>
                </Field>
              </Stack>

              {hasCheque && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <SectionTitle>Cheque asociado</SectionTitle>
                    <ChequeDetailsView chequeId={gasto.chequeId} />
                  </Stack>
                </>
              )}

              <Divider />

              <Stack spacing={1.5}>
                <SectionTitle>Cargos bancarios</SectionTitle>
                <Row>
                  <Field label="Gastos Bancarios">
                    {getFormattedPrice(gasto.gastosBancarios ?? 0)}
                  </Field>
                  <Field label="Gastos ARBA">
                    {getFormattedPrice(gasto.gastosArba ?? 0)}
                  </Field>
                </Row>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
