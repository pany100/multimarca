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

export default function VerExtraccionPage({
  params,
}: {
  params: { id: string };
}) {
  const { authFetch } = useFetch();
  const id = parseInt(params.id);
  const [extraccion, setExtraccion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/api/extracciones/${id}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(body?.error || "No se pudo cargar la extracción");
          return;
        }
        setExtraccion(body);
      } catch {
        if (!cancelled) setError("Error de red al cargar la extracción");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch, id]);

  const tipoOperacionId = extraccion?.tipoOperacionId as number | undefined;
  const hasCheque =
    typeof tipoOperacionId === "number" &&
    CHEQUE_OPERACION_IDS.includes(tipoOperacionId) &&
    !!extraccion?.chequeId;

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
          href="/dashboard/extracciones"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
        {extraccion && !error && (
          <Button
            component={Link}
            href={`/dashboard/extracciones/${id}/editar`}
            startIcon={<EditIcon />}
            variant="contained"
          >
            Editar
          </Button>
        )}
      </Box>

      <Card>
        <CardHeader
          title={`Extracción #${id}`}
          subheader="Detalle de la extracción"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && !extraccion && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!error && extraccion && (
            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <SectionTitle>Fecha y usuario</SectionTitle>
                <Row>
                  <Field label="Fecha">
                    {getFormattedDate(extraccion.fecha)}
                  </Field>
                  <Field label="Usuario">
                    {extraccion.usuario?.fullName || "No especificado"}
                  </Field>
                </Row>
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <SectionTitle>Detalles de la extracción</SectionTitle>
                <Field label="Tipo de Operación">
                  {extraccion.tipoOperacion?.label || "No especificado"}
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
                      {getFormattedPrice(extraccion.monto)}
                      <Chip
                        label={extraccion.moneda}
                        color={
                          extraccion.moneda === "Dolar"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </Box>
                  </Field>
                  {extraccion.moneda === "Dolar" && (
                    <Field label="Cotización">
                      {extraccion.cotizacionDolar != null
                        ? `${getFormattedPrice(extraccion.cotizacionDolar)} ARS / USD`
                        : "—"}
                    </Field>
                  )}
                </Row>
                <Field label="Motivo">
                  <Box
                    component="span"
                    sx={{ whiteSpace: "pre-wrap", fontWeight: 400 }}
                  >
                    {extraccion.motivo || "Sin motivo"}
                  </Box>
                </Field>
              </Stack>

              {hasCheque && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <SectionTitle>Cheque asociado</SectionTitle>
                    <ChequeDetailsView chequeId={extraccion.chequeId} />
                  </Stack>
                </>
              )}

              <Divider />

              <Stack spacing={1.5}>
                <SectionTitle>Cargos bancarios</SectionTitle>
                <Row>
                  <Field label="Gastos Bancarios">
                    {getFormattedPrice(extraccion.gastosBancarios ?? 0)}
                  </Field>
                  <Field label="Gastos ARBA">
                    {getFormattedPrice(extraccion.gastosArba ?? 0)}
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
