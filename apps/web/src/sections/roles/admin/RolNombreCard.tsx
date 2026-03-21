"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import type { RolDetalle } from "./types";

const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
});

type FormData = yup.InferType<typeof schema>;

type Props = {
  rol: RolDetalle;
  onUpdated: (rol: RolDetalle) => void;
};

export function RolNombreCard({ rol, onUpdated }: Props) {
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: rol.name },
  });

  useEffect(() => {
    methods.reset({ name: rol.name });
  }, [rol.name, methods]);

  const handleOpen = () => {
    methods.reset({ name: rol.name });
  };

  const handleSubmit = async (data: FormData) => {
    const res = await authFetch(`/api/roles/${rol.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: data.name.trim() }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSnackbar({
        open: true,
        message: body?.error || "No se pudo actualizar el nombre",
        severity: "error",
      });
      throw new Error(body?.error || "Error");
    }
    onUpdated(body as RolDetalle);
    setSnackbar({
      open: true,
      message: "Nombre del rol actualizado",
      severity: "success",
    });
  };

  return (
    <CommonOrderCard
      dense
      title="Nombre del rol"
      modalTitle="Editar nombre del rol"
      formMethods={methods}
      onOpen={handleOpen}
      onSubmit={handleSubmit}
      submitButtonText="Guardar"
      maxWidth="sm"
      formContent={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomInputText name="name" label="Nombre del rol" />
          </Grid>
        </Grid>
      }
    >
      <Typography variant="body1" component="div" sx={{ lineHeight: 1.45, fontWeight: 600 }}>
        {rol.name}
      </Typography>
    </CommonOrderCard>
  );
}
