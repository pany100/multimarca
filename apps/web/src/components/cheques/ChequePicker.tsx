"use client";

import { useFetch } from "@/contexts/FetchContext";
import useChequesAutocomplete from "@/hooks/useChequesAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ChequeDetailsView, { ChequeDetailsData } from "./ChequeDetailsView";
import ChequeFormDialog, { ChequeSummary } from "./ChequeFormDialog";

type Option = { label: string; value: number };

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

const ChequePicker = ({ name = "chequeId", label = "Cheque" }: Props) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const chequeId = watch(name) as number | null | undefined;

  const { authFetch } = useFetch();
  const { searchCheques } = useChequesAutocomplete();

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [details, setDetails] = useState<ChequeDetailsData | null>(null);
  const [detailsRefresh, setDetailsRefresh] = useState(0);

  useEffect(() => {
    if (!chequeId) {
      setDetails(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/api/cheques/${chequeId}`);
        if (!res.ok) return;
        const body = await res.json();
        if (cancelled) return;
        const cheque: ChequeDetailsData = {
          id: body.id,
          numero: body.numero,
          banco: body.banco,
          owner: body.owner,
          importe: Number(body.importe),
          fechaEmision: body.fechaEmision,
          fechaCobro: body.fechaCobro,
          picturePath: body.picturePath ?? null,
          rechazado: body.rechazado,
        };
        setDetails(cheque);
        const option: Option = {
          label: buildLabel(cheque),
          value: cheque.id,
        };
        setOptions((prev) =>
          prev.some((o) => o.value === option.value)
            ? prev
            : [option, ...prev]
        );
      } catch {
        // silent
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
          const numericValue = value != null ? Number(value) : null;
          const fromOptions =
            numericValue != null
              ? options.find((o) => o.value === numericValue)
              : null;
          const fromDetails =
            !fromOptions && details && details.id === numericValue
              ? { label: buildLabel(details), value: details.id }
              : null;
          const currentValue = fromOptions ?? fromDetails ?? null;
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

      {chequeId && details ? (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ChequeDetailsView data={details} />
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
