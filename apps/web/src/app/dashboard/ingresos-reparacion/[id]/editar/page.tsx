"use client";

import { useFetch } from "@/contexts/FetchContext";
import PagoReparacionForm from "@/sections/ingresos-reparacion/PagoReparacionForm";
import { OrdenConDeuda } from "@/sections/ingresos-reparacion/OrdenSearchAutocomplete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

type Params = { params: { id: string } };

const EditarPagoReparacionPage = ({ params }: Params) => {
  const { authFetch } = useFetch();
  const id = parseInt(params.id);
  const [initialValues, setInitialValues] = useState<Record<string, any> | null>(
    null
  );
  const [initialOrden, setInitialOrden] = useState<OrdenConDeuda | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/api/ingresos-reparacion/${id}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(body?.error || "No se pudo cargar el pago");
          return;
        }
        setInitialValues({
          monto: body.monto != null ? Number(body.monto) : undefined,
          fecha: body.fecha ? new Date(body.fecha) : undefined,
          moneda: body.moneda ?? "Peso",
          cotizacionDolar:
            body.cotizacionDolar != null
              ? Number(body.cotizacionDolar)
              : undefined,
          descripcion: body.descripcion ?? "",
          tipoOperacionId: body.tipoOperacionId,
          ordenReparacionId: body.ordenReparacionId,
          chequeId: body.chequeId ?? null,
          gastosBancarios:
            body.gastosBancarios != null ? Number(body.gastosBancarios) : 0,
          gastosArba: body.gastosArba != null ? Number(body.gastosArba) : 0,
        });

        const orden = body.ordenReparacion;
        if (orden) {
          setInitialOrden({
            id: orden.id,
            fecha:
              orden.fechaEntradaReparacion ??
              orden.fechaCreacion ??
              orden.fecha ??
              new Date().toISOString(),
            estado: orden.estado ?? "—",
            auto: orden.auto
              ? {
                  patent: orden.auto.patent,
                  brand: orden.auto.brand ?? null,
                  model: orden.auto.model ?? null,
                }
              : null,
            clienteId: body.clienteId ?? null,
            clienteNombre: body.cliente?.fullName ?? null,
            totalAPagar: Number(orden.totalAPagar ?? 0),
            totalPagado: Number(orden.totalPagado ?? 0),
            deuda: Number(orden.deuda ?? 0),
          });
        }
      } catch {
        if (!cancelled) setError("Error de red al cargar el pago");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch, id]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard/ingresos-reparacion"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Editar Pago de Reparación"
          subheader={`Modificá los datos del pago #${id}`}
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && (!initialValues || !initialOrden) && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!error && initialValues && initialOrden && (
            <PagoReparacionForm
              mode="edit"
              id={id}
              initialValues={initialValues}
              initialOrden={initialOrden}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditarPagoReparacionPage;
