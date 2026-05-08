"use client";

import { useFetch } from "@/contexts/FetchContext";
import useChequesAutocomplete from "@/hooks/useChequesAutocomplete";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ChequeFormDialog, { ChequeSummary } from "./ChequeFormDialog";

type Option = { label: string; value: number };

type ChequeDetails = {
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

type Props = {
  name?: string;
  label?: string;
};

const buildLabel = (cheque: {
  numero: string;
  banco: string;
  importe: number;
}) =>
  `Nro ${cheque.numero} - Banco ${cheque.banco} - Importe ${getFormattedPrice(
    cheque.importe
  )}`;

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

const ChequePicker = ({ name = "chequeId", label = "Cheque" }: Props) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const chequeId = watch(name) as number | null | undefined;

  const { authFetch } = useFetch();
  const { searchCheques, initialCheque } = useChequesAutocomplete();

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [details, setDetails] = useState<ChequeDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsRefresh, setDetailsRefresh] = useState(0);
  const initialLoadedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!chequeId) return;
    if (options.some((o) => o.value === chequeId)) return;
    if (initialLoadedFor.current === chequeId) return;
    initialLoadedFor.current = chequeId;
    let cancelled = false;
    (async () => {
      try {
        const option = await initialCheque(String(chequeId));
        if (cancelled) return;
        setOptions((prev) =>
          prev.some((o) => o.value === option.value)
            ? prev
            : [{ label: option.label, value: Number(option.value) }, ...prev]
        );
      } catch {
        // silent — el field quedará sin label hasta que el usuario busque
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chequeId, options, initialCheque]);

  useEffect(() => {
    if (!chequeId) {
      setDetails(null);
      setDetailsError(null);
      return;
    }
    let cancelled = false;
    setDetailsLoading(true);
    setDetailsError(null);
    (async () => {
      try {
        const res = await authFetch(`/api/cheques/${chequeId}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setDetails(null);
          setDetailsError(body?.error || "No se pudo cargar el cheque");
          return;
        }
        setDetails({
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
        if (!cancelled) setDetailsError("Error de red al cargar el cheque");
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chequeId, authFetch, detailsRefresh]);

  const fetchOptions = useMemo(
    () =>
      debounce(async (query: string) => {
        setLoading(true);
        try {
          const results = await searchCheques(query);
          setOptions(
            results.map((r: any) => ({
              label: r.label,
              value: Number(r.value),
            }))
          );
        } catch {
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 300),
    [searchCheques]
  );

  const handleSaved = (cheque: ChequeSummary) => {
    const option: Option = { label: buildLabel(cheque), value: cheque.id };
    setOptions((prev) => {
      const next = prev.filter((o) => o.value !== cheque.id);
      return [option, ...next];
    });
    if (cheque.id === chequeId) {
      setDetailsRefresh((n) => n + 1);
    } else {
      setValue(name, cheque.id, { shouldValidate: true, shouldDirty: true });
    }
  };

  const error = errors[name];
  const errorMessage = error?.message?.toString();

  const showPdf =
    !!details?.picturePath && isPdfPath(details.picturePath);

  return (
    <Paper
      elevation={1}
      sx={{ p: 2, borderRadius: 2, backgroundColor: "#fafafa" }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          sx={{ color: "primary.main", fontWeight: "medium" }}
        >
          Datos del Cheque
        </Typography>
        <Stack direction="row" spacing={1}>
          {chequeId ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                setDialogMode("edit");
                setDialogOpen(true);
              }}
            >
              Editar
            </Button>
          ) : null}
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogMode("create");
              setDialogOpen(true);
            }}
          >
            Nuevo
          </Button>
        </Stack>
      </Box>

      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          const currentValue =
            value != null
              ? options.find((o) => o.value === Number(value)) || null
              : null;
          return (
            <Autocomplete
              options={options}
              loading={loading}
              value={currentValue}
              onChange={(_, newValue) => onChange(newValue?.value ?? null)}
              onInputChange={(_, input, reason) => {
                if (input.length >= 2 && reason !== "reset") {
                  fetchOptions(input);
                }
              }}
              isOptionEqualToValue={(option, val) =>
                option.value === val.value
              }
              getOptionLabel={(option) => option.label}
              noOptionsText="Buscá por número, banco o emisor"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  fullWidth
                  error={!!error}
                  helperText={errorMessage}
                />
              )}
            />
          );
        }}
      />

      {chequeId ? (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />

          {detailsLoading && (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!detailsLoading && detailsError && (
            <Typography variant="body2" color="error">
              {detailsError}
            </Typography>
          )}

          {!detailsLoading && !detailsError && details && (
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
          )}
        </Box>
      ) : null}

      <ChequeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
        chequeId={dialogMode === "edit" ? chequeId ?? null : null}
      />
    </Paper>
  );
};

export default ChequePicker;
