import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";
import useControlesAutocomplete from "./hooks/useControlesAutocomplete";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  type: yup.string().required("El tipo es requerido"),
  pdfName: yup.string().nullable(),
  ordenEnPdf: yup.number().nullable(),
  parentId: yup.number().nullable(),
});

const ControlesForm = () => {
  const { searchControles, initialControl } = useControlesAutocomplete();
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información Del Control
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="name" label="Nombre del Control" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="type"
            label="Tipo"
            options={[
              { value: "texto", label: "Texto" },
              { value: "checkbox", label: "Checkbox" },
              { value: "grupo", label: "Compuesto" },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="pdfName" label="Nombre para el detalle" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="ordenEnPdf"
            label="Orden en PDF"
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <CustomAutocompleteInput
            name="parentId"
            label="Control Padre"
            searchOptions={searchControles}
            initialOptions={initialControl}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ControlesForm;
