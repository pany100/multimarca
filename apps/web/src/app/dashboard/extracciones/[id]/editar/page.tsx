"use client";

import { useFetch } from "@/contexts/FetchContext";
import ExtraccionForm from "@/sections/extracciones/ExtraccionForm";
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

const EditarExtraccionPage = ({ params }: Params) => {
  const { authFetch } = useFetch();
  const id = parseInt(params.id);
  const [initialValues, setInitialValues] = useState<Record<string, any> | null>(
    null
  );
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
        setInitialValues({
          monto: body.monto != null ? Number(body.monto) : undefined,
          fecha: body.fecha ? new Date(body.fecha) : undefined,
          moneda: body.moneda ?? "Peso",
          cotizacionDolar:
            body.cotizacionDolar != null
              ? Number(body.cotizacionDolar)
              : undefined,
          usuarioId: body.usuarioId,
          motivo: body.motivo ?? "",
          tipoOperacionId: body.tipoOperacionId,
          chequeId: body.chequeId ?? null,
          gastosBancarios:
            body.gastosBancarios != null ? Number(body.gastosBancarios) : 0,
          gastosArba: body.gastosArba != null ? Number(body.gastosArba) : 0,
        });
      } catch {
        if (!cancelled) setError("Error de red al cargar la extracción");
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
          href="/dashboard/extracciones"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Editar Extracción"
          subheader={`Modificá los datos de la extracción #${id}`}
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!error && !initialValues && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!error && initialValues && (
            <ExtraccionForm
              mode="edit"
              id={id}
              initialValues={initialValues}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditarExtraccionPage;
