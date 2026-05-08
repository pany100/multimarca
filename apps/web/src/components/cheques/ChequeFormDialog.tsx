"use client";

import CommonModalForm from "@/components/commons/CommonModalForm";
import CustomInputText from "@/components/formV2/CustomInputText";
import ImageInput from "@/components/ImageInput";
import { useFetch } from "@/contexts/FetchContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object({
  numero: yup.string().required("El número de cheque es requerido"),
  banco: yup.string().required("El banco es requerido"),
  owner: yup.string().required("El emisor es requerido"),
  importe: yup
    .number()
    .typeError("El importe debe ser un número")
    .positive("El importe debe ser mayor a 0")
    .required("El importe es requerido"),
  fechaEmision: yup.date().required("La fecha de emisión es requerida"),
  fechaCobro: yup.date().required("La fecha de cobro es requerida"),
  picturePath: yup.string().required("La foto es requerida"),
});

type FormData = yup.InferType<typeof schema>;

export type ChequeSummary = {
  id: number;
  numero: string;
  banco: string;
  owner: string;
  importe: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (cheque: ChequeSummary) => void;
  chequeId?: number | null;
};

const emptyDefaults: any = {
  numero: "",
  banco: "",
  owner: "",
  importe: undefined,
  fechaEmision: undefined,
  fechaCobro: undefined,
  picturePath: "",
};

const ChequeFormDialog = ({ open, onClose, onSaved, chequeId }: Props) => {
  const { authFetch } = useFetch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: emptyDefaults,
  });

  const isEdit = typeof chequeId === "number";

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    if (!isEdit) {
      methods.reset(emptyDefaults);
      return;
    }
    let cancelled = false;
    setPrefilling(true);
    (async () => {
      try {
        const res = await authFetch(`/api/cheques/${chequeId}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setSubmitError(body?.error || "No se pudo cargar el cheque");
          return;
        }
        methods.reset({
          numero: body.numero ?? "",
          banco: body.banco ?? "",
          owner: body.owner ?? "",
          importe: body.importe != null ? Number(body.importe) : undefined,
          fechaEmision: body.fechaEmision
            ? new Date(body.fechaEmision)
            : undefined,
          fechaCobro: body.fechaCobro ? new Date(body.fechaCobro) : undefined,
          picturePath: body.picturePath ?? "",
        });
      } catch {
        if (!cancelled) setSubmitError("Error de red al cargar el cheque");
      } finally {
        if (!cancelled) setPrefilling(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, chequeId, isEdit, authFetch, methods]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = async (data: FormData) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const url = isEdit ? `/api/cheques/${chequeId}` : "/api/cheques";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit
        ? { ...data, rechazado: "No" }
        : data;
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(body?.error || "No se pudo guardar el cheque");
        return;
      }
      onSaved({
        id: body.id,
        numero: body.numero,
        banco: body.banco,
        owner: body.owner,
        importe: Number(body.importe),
      });
      onClose();
    } catch {
      setSubmitError("Error de red al guardar el cheque");
    } finally {
      setLoading(false);
    }
  };

  const picturePath = methods.watch("picturePath");
  const pictureError = methods.formState.errors.picturePath;

  return (
    <CommonModalForm
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEdit ? "Editar cheque" : "Nuevo cheque"}
      methods={methods}
      loading={loading || prefilling}
      submitButtonText={isEdit ? "Guardar cambios" : "Crear cheque"}
      maxWidth="sm"
    >
      <Grid container spacing={2}>
        {submitError && (
          <Grid item xs={12}>
            <Alert severity="error">{submitError}</Alert>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <CustomInputText name="numero" label="Número de cheque" autoFocus />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="banco" label="Banco" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="owner" label="Emisor" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="importe" label="Importe" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="fechaEmision"
            label="Fecha emisión"
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fechaCobro" label="Fecha cobro" type="date" />
        </Grid>
        <Grid item xs={12}>
          <ImageInput
            label="Foto"
            image={picturePath || ""}
            setImage={(value) =>
              methods.setValue("picturePath", value ?? "", {
                shouldValidate: true,
              })
            }
          />
          {pictureError && (
            <Typography variant="subtitle2" color="error" sx={{ mt: 1 }}>
              {pictureError.message as string}
            </Typography>
          )}
        </Grid>
      </Grid>
    </CommonModalForm>
  );
};

export default ChequeFormDialog;
