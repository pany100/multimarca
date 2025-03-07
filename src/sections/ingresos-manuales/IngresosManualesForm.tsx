"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { useFetch } from "@/contexts/FetchContext";
import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as yup from "yup";

export const schema = yup.object({
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  fecha: yup.date().required("La fecha es requerida"),
  moneda: yup
    .string()
    .oneOf(["Peso", "Dolar"])
    .required("La moneda es requerida"),
  usuarioId: yup.number().required("El usuario es requerido"),
  descripcion: yup.string().required("La descripción es requerida"),
  tipoExtraccion: yup
    .string()
    .oneOf([
      "EFECTIVO",
      "TRANSFERENCIA",
      "CHEQUE",
      "DEBITO_AUTOMATICO_TARJETA_CREDITO",
    ])
    .required("El tipo de operación es requerido"),
});

const IngresosManualesForm = () => {
  const [usuarios, setUsuarios] = useState<{ value: number; label: string }[]>(
    []
  );
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await authFetch("/api/usuarios/admins");
        const data = await response.json();
        const customUsuarios = data.map(
          (usuario: { id: number; fullName: string }) => ({
            value: usuario.id,
            label: usuario.fullName,
          })
        );
        setUsuarios(customUsuarios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
  }, [authFetch]);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Ingreso
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="monto" label="Monto" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            options={[
              { value: "Peso", label: "Peso" },
              { value: "Dolar", label: "Dolar" },
            ]}
            name="moneda"
            label="Moneda"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect options={usuarios} name="usuarioId" label="Usuario" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText name="descripcion" label="Descripción" />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect
            options={[
              { value: "EFECTIVO", label: "Efectivo" },
              { value: "TRANSFERENCIA", label: "Transferencia" },
              { value: "CHEQUE", label: "Cheque" },
              {
                value: "DEBITO_AUTOMATICO_TARJETA_CREDITO",
                label: "Débito Automático tarjeta crédito",
              },
            ]}
            name="tipoExtraccion"
            label="Tipo de Operación"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default IngresosManualesForm;
