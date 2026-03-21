"use client";

import CommonModalForm from "@/components/commons/CommonModalForm";
import CustomInputText from "@/components/formV2/CustomInputText";
import { useFetch } from "@/contexts/FetchContext";
import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Grid } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().required("El nombre del rol es requerido"),
});

type FormData = yup.InferType<typeof schema>;

type Props = {
  onCreated?: () => void;
};

const NuevoRolModal = ({ onCreated }: Props) => {
  const { isOpen, hideModal } = useGlobalModal();
  const { authFetch } = useFetch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
  });

  const handleClose = () => {
    methods.reset();
    setSubmitError(null);
    hideModal();
  };

  const handleSubmit = async (data: FormData) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const response = await authFetch("/api/roles", {
        method: "POST",
        body: JSON.stringify({ name: data.name.trim(), permisos: [] }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitError(body?.error || "No se pudo crear el rol");
        return;
      }
      onCreated?.();
      handleClose();
    } catch {
      setSubmitError("Error de red al crear el rol");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonModalForm
      open={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Nuevo rol"
      methods={methods}
      loading={loading}
      submitButtonText="Crear rol"
      maxWidth="sm"
    >
      <Grid container spacing={2}>
        {submitError && (
          <Grid item xs={12}>
            <Alert severity="error">{submitError}</Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <CustomInputText name="name" label="Nombre del rol" autoFocus />
        </Grid>
      </Grid>
    </CommonModalForm>
  );
};

export default NuevoRolModal;
