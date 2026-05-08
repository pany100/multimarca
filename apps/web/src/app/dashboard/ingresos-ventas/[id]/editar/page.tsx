"use client";

import { useFetch } from "@/contexts/FetchContext";
import PagoVentaForm from "@/sections/ingresos-ventas/PagoVentaForm";
import { VentaConDeuda } from "@/sections/ingresos-ventas/VentaSearchAutocomplete";
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

const EditarPagoVentaPage = ({ params }: Params) => {
  const { authFetch } = useFetch();
  const id = parseInt(params.id);
  const [initialValues, setInitialValues] = useState<Record<string, any> | null>(
    null
  );
  const [initialVenta, setInitialVenta] = useState<VentaConDeuda | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          ventaId: body.ventaId,
          chequeId: body.chequeId ?? null,
          gastosBancarios:
            body.gastosBancarios != null ? Number(body.gastosBancarios) : 0,
          gastosArba: body.gastosArba != null ? Number(body.gastosArba) : 0,
        });

        const venta = body.venta;
        if (venta) {
          setInitialVenta({
            id: venta.id,
            fecha: venta.fecha ?? new Date().toISOString(),
            estado: venta.estado ?? "—",
            clienteId: body.clienteId ?? venta.clienteId ?? null,
            informacionCliente:
              body.informacionCliente ?? venta.informacionCliente ?? null,
            clienteNombre:
              body.cliente?.fullName ??
              venta.cliente?.fullName ??
              body.informacionCliente ??
              null,
            totalAPagar: Number(venta.totalAPagar ?? 0),
            totalPagado: Number(venta.totalPagado ?? 0),
            deuda: Number(venta.deuda ?? 0),
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
          href="/dashboard/ingresos-ventas"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Editar Pago de Venta"
          subheader={`Modificá los datos del pago #${id}`}
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && (!initialValues || !initialVenta) && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!error && initialValues && initialVenta && (
            <PagoVentaForm
              mode="edit"
              id={id}
              initialValues={initialValues}
              initialVenta={initialVenta}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditarPagoVentaPage;
