import { Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import ImageInput from "./ImageInput";

type Props = {
  handleFieldChange: (field: string, value: any) => void;
  sourceField: string;
  watch: UseFormWatch<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  item: any;
};

function ChequeForm({
  sourceField,
  watch,
  handleFieldChange,
  register,
  errors,
  item,
}: Props) {
  const [chequeValue, setChequeValue] = useState("");

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === sourceField) {
        setChequeValue(value[sourceField]);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, sourceField]);

  if (!chequeValue || chequeValue !== "CHEQUE") {
    return null;
  }
  if (!register("picturePath")) {
    register("picturePath", { required: true });
  }
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          margin="normal"
          label="Fecha Emisión"
          {...register("fechaEmision")}
          error={!!errors["fechaEmision"]}
          helperText={errors["fechaEmision"]?.message as string}
          type="date"
          InputLabelProps={{ shrink: true }}
          value={
            item?.["fechaEmision"]
              ? new Date(item["fechaEmision"] as string)
                  .toISOString()
                  .split("T")[0]
              : ""
          }
          onChange={(e) => handleFieldChange("fechaEmision", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          margin="normal"
          label="Fecha Cobro"
          {...register("fechaCobro")}
          error={!!errors["fechaCobro"]}
          helperText={errors["fechaCobro"]?.message as string}
          type="date"
          InputLabelProps={{ shrink: true }}
          value={
            item?.["fechaCobro"]
              ? new Date(item["fechaCobro"] as string)
                  .toISOString()
                  .split("T")[0]
              : ""
          }
          onChange={(e) => handleFieldChange("fechaCobro", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          margin="normal"
          {...register("numeroCheque")}
          error={!!errors["numeroCheque"]}
          helperText={errors["numeroCheque"]?.message as string}
          label="Número Cheque"
          type="text"
          value={item?.["numeroCheque"] || ""}
          onChange={(e) => handleFieldChange("numeroCheque", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          margin="normal"
          label="Banco"
          {...register("banco")}
          error={!!errors["banco"]}
          helperText={errors["banco"]?.message as string}
          type="text"
          value={item?.["banco"] || ""}
          onChange={(e) => handleFieldChange("banco", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          margin="normal"
          label="Monto"
          {...register("monto")}
          error={!!errors["monto"]}
          helperText={errors["monto"]?.message as string}
          type="number"
          value={item?.["monto"] || ""}
          onChange={(e) => handleFieldChange("monto", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          margin="normal"
          label="Emisor"
          {...register("emisor")}
          error={!!errors["emisor"]}
          helperText={errors["emisor"]?.message as string}
          type="text"
          value={item?.["emisor"] || ""}
          onChange={(e) => handleFieldChange("emisor", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <ImageInput
          label="Foto"
          image={item?.["picturePath"] || ""}
          setImage={(e) => handleFieldChange("picturePath", e)}
        />
      </Grid>
    </Grid>
  );
}

export default ChequeForm;
