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

export default function VerIngresoManualPage({
  params,
}: {
  params: { id: string };
}) {
  const { authFetch } = useFetch();
  const id = parseInt(params.id);
  const [ingreso, setIngreso] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/api/ingresos-manuales/${id}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(body?.error || "No se pudo cargar el ingreso");
          return;
        }
        setIngreso(body);
      } catch {
        if (!cancelled) setError("Error de red al cargar el ingreso");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch, id]);

  const tipoOperacionId = ingreso?.tipoOperacionId as number | undefined;
  const hasCheque =
    typeof tipoOperacionId === "number" &&
    CHEQUE_OPERACION_IDS.includes(tipoOperacionId) &&
    !!ingreso?.chequeId;

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
          href="/dashboard/ingresos-manuales"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
        {ingreso && !error && (
          <Button
            component={Link}
            href={`/dashboard/ingresos-manuales/${id}/editar`}
            startIcon={<EditIcon />}
            variant="contained"
          >
            Editar
          </Button>
        )}
      </Box>

      <Card>
        <CardHeader
          title={`Ingreso Manual #${id}`}
          subheader="Detalle del ingreso"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && !ingreso && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!error && ingreso && (
            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <SectionTitle>Fecha y usuario</SectionTitle>
                <Row>
                  <Field label="Fecha">{getFormattedDate(ingreso.fecha)}</Field>
                  <Field label="Usuario">
                    {ingreso.usuario?.fullName || "No especificado"}
                  </Field>
                </Row>
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <SectionTitle>Detalles del ingreso</SectionTitle>
                <Field label="Tipo de Operación">
                  {ingreso.tipoOperacion?.label || "No especificado"}
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
                      {getFormattedPrice(ingreso.monto)}
                      <Chip
                        label={ingreso.moneda}
                        color={
                          ingreso.moneda === "Dolar" ? "success" : "warning"
                        }
                        size="small"
                      />
                    </Box>
                  </Field>
                  {ingreso.moneda === "Dolar" && (
                    <Field label="Cotización">
                      {ingreso.cotizacionDolar != null
                        ? `${getFormattedPrice(ingreso.cotizacionDolar)} ARS / USD`
                        : "—"}
                    </Field>
                  )}
                </Row>
                <Field label="Descripción">
                  <Box
                    component="span"
                    sx={{ whiteSpace: "pre-wrap", fontWeight: 400 }}
                  >
                    {ingreso.descripcion || "Sin descripción"}
                  </Box>
                </Field>
              </Stack>

              {hasCheque && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <SectionTitle>Cheque asociado</SectionTitle>
                    <ChequeDetailsView chequeId={ingreso.chequeId} />
                  </Stack>
                </>
              )}

              <Divider />

              <Stack spacing={1.5}>
                <SectionTitle>Cargos bancarios</SectionTitle>
                <Row>
                  <Field label="Gastos Bancarios">
                    {getFormattedPrice(ingreso.gastosBancarios ?? 0)}
                  </Field>
                  <Field label="Gastos ARBA">
                    {getFormattedPrice(ingreso.gastosArba ?? 0)}
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
