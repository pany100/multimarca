"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import ImageInput from "@/components/ImageInput";
import { getFormattedChequeType } from "@/utils/fieldHelper";
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
  numeroCheque: yup.string().required("El número de cheque es requerido"),
  banco: yup.string().required("El banco es requerido"),
  importe: yup
    .number()
    .typeError("El importe debe ser un número")
    .required("El importe es requerido"),
  emisor: yup.string().required("El emisor es requerido"),
  picturePath: yup.string().required("La foto es requerida"),
});

const ChequesForm = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const picturePath = watch("picturePath");
  const operaciones = watch("operaciones") || [];
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
                      <TableCell>{operacion.idOperacion}</TableCell>
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
      </Grid>
    </>
  );
};

export default ChequesForm;
