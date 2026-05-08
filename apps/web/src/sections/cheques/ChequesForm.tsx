"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import ImageInput from "@/components/ImageInput";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import {
  getFormattedChequeType,
  getOperacionChequeUrl,
} from "@/utils/fieldHelper";
import Link from "next/link";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  fechaEmision: yup.date().required("La fecha de emisión es requerida"),
  fechaCobro: yup.date().required("La fecha de cobro es requerida"),
  numero: yup.string().required("El número de cheque es requerido"),
  banco: yup.string().required("El banco es requerido"),
  importe: yup
    .number()
    .typeError("El importe debe ser un número")
    .required("El importe es requerido"),
  owner: yup.string().required("El emisor es requerido"),
  picturePath: yup.string().required("La foto es requerida"),
  rechazado: yup
    .string()
    .oneOf(["Si", "No"])
    .required("El rechazado es requerido"),
  fechaRechazo: yup.date().when("rechazado", {
    is: "Si",
    then: (schema) => schema.required("La fecha de rechazo es requerida"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  gastosAdministrativos: yup
    .number()
    .typeError("El gasto administrativo debe ser un número")
    .when("rechazado", {
      is: "Si",
      then: (schema) => schema.required("El gasto administrativo es requerido"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  observaciones: yup.string().when("rechazado", {
    is: "Si",
    then: (schema) =>
      schema.required(
        "Las observaciones son requeridas cuando el cheque es rechazado"
      ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

const ChequesForm = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const picturePath = watch("picturePath");
  const { siNo } = useFixedSelectData();
  const operaciones = watch("operaciones") || [];
  const rechazado = watch("rechazado");
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del cheque
      </Typography>
      {operaciones.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Operaciones
          </Typography>
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operaciones.map(
                  (
                    operacion: {
                      idOperacion: number;
                      tipo: string;
                      fecha: string;
                      descripcion: string;
                    },
                    index: number
                  ) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Link
                          href={getOperacionChequeUrl(
                            operacion.tipo,
                            operacion.idOperacion
                          )}
                          style={{ textDecoration: "underline" }}
                        >
                          {operacion.idOperacion}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {getFormattedChequeType(operacion.tipo)}
                      </TableCell>
                      <TableCell>
                        {new Date(operacion.fecha).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell>{operacion.descripcion}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      <Grid container spacing={2}>
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
        <Grid item xs={12} md={6}>
          <CustomInputText name="numero" label="Número de Cheque" type="text" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="banco" label="Banco" type="text" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="importe" label="Importe" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="owner" label="Emisor" type="text" />
        </Grid>
        <Grid item xs={12} md={12}>
          <ImageInput
            label="Foto"
            image={picturePath || ""}
            setImage={(e) => setValue("picturePath", e)}
          />
          {errors.picturePath && (
            <Typography variant="subtitle2" color="error" sx={{ mt: 1 }}>
              {errors.picturePath.message as string}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect name="rechazado" label="Rechazado" options={siNo} />
        </Grid>
        {rechazado === "Si" && (
          <>
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="fechaRechazo"
                label="Fecha de rechazo"
                type="date"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="gastosAdministrativos"
                label="Gastos administrativos"
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="observaciones"
                label="Observaciones"
                type="text"
              />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default ChequesForm;
