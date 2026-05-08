"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

export type ChequeDetailsData = {
  id: number;
  numero: string;
  banco: string;
  owner: string;
  importe: number;
  fechaEmision: string;
  fechaCobro: string;
  picturePath: string | null;
  rechazado?: string;
};

const isPdfPath = (path: string) => {
  const clean = path.split("?")[0].split("#")[0];
  return clean.toLowerCase().endsWith(".pdf");
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: "flex", flexDirection: "column" }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);

type Props = {
  /** Si se pasa `data`, renderiza directo. Si no, fetchea con `chequeId`. */
  data?: ChequeDetailsData | null;
  chequeId?: number | null;
  refreshKey?: number;
};

const ChequeDetailsView = ({ data, chequeId, refreshKey = 0 }: Props) => {
  const { authFetch } = useFetch();
  const [fetched, setFetched] = useState<ChequeDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usingData = data !== undefined;

  useEffect(() => {
    if (usingData) return;
    if (!chequeId) {
      setFetched(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await authFetch(`/api/cheques/${chequeId}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setFetched(null);
          setError(body?.error || "No se pudo cargar el cheque");
          return;
        }
        setFetched({
          id: body.id,
          numero: body.numero,
          banco: body.banco,
          owner: body.owner,
          importe: Number(body.importe),
          fechaEmision: body.fechaEmision,
          fechaCobro: body.fechaCobro,
          picturePath: body.picturePath ?? null,
          rechazado: body.rechazado,
        });
      } catch {
        if (!cancelled) setError("Error de red al cargar el cheque");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chequeId, authFetch, refreshKey, usingData]);

  const details = usingData ? data ?? null : fetched;

  if (!usingData && !chequeId) return null;
  if (usingData && !details) return null;

  if (!usingData && loading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!usingData && error) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  }

  if (!details) return null;

  const showPdf = !!details.picturePath && isPdfPath(details.picturePath);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        <DetailRow label="Número" value={details.numero} />
        <DetailRow label="Banco" value={details.banco} />
        <DetailRow label="Emisor" value={details.owner} />
        <DetailRow
          label="Importe"
          value={getFormattedPrice(details.importe)}
        />
        <DetailRow
          label="Fecha emisión"
          value={getFormattedDate(details.fechaEmision)}
        />
        <DetailRow
          label="Fecha cobro"
          value={getFormattedDate(details.fechaCobro)}
        />
        {details.rechazado === "Si" && (
          <DetailRow label="Estado" value="Rechazado" />
        )}
      </Box>

      {details.picturePath ? (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            Foto del cheque
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              backgroundColor: "background.paper",
              borderRadius: 1,
              p: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {showPdf ? (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 500,
                  height: 360,
                  overflow: "hidden",
                  borderRadius: 1,
                }}
              >
                <iframe
                  src={details.picturePath ?? ""}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title={`Cheque ${details.numero}`}
                />
              </Box>
            ) : (
              <Image
                src={details.picturePath}
                alt={`Cheque ${details.numero}`}
                width={400}
                height={260}
                style={{
                  maxWidth: "100%",
                  width: "auto",
                  height: "auto",
                  maxHeight: 320,
                }}
              />
            )}
          </Box>
          {showPdf && (
            <Box display="flex" justifyContent="center" mt={1}>
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  window.open(details.picturePath ?? "", "_blank")
                }
              >
                Abrir PDF en nueva pestaña
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Este cheque no tiene foto cargada.
        </Typography>
      )}
    </Stack>
  );
};

export default ChequeDetailsView;
