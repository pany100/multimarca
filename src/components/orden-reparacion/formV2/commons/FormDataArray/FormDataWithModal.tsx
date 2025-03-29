import { FormDataWithModalProvider } from "@/contexts/FormDataWithModalContext";
import { Grid } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useFormContext } from "react-hook-form";
import FormDataAddButton from "./FormDataAddButton";
import FormDataEmptyInfo from "./FormDataEmptyInfo";
import FormDataModal from "./FormDataModal";
import FormDataTable from "./FormDataTable";

type Props = {
  fieldName: string;
  form: React.ComponentType<any>;
  columns: GridColDef[];
  rowsTransform?: (row: any, index: number) => any;
};

function FormDataArrayWithModal({
  fieldName,
  form: InnerForm,
  columns,
  rowsTransform,
}: Props) {
  const { watch } = useFormContext();

  const values = watch(fieldName);
  const rows = typeof values === "string" ? JSON.parse(values || "[]") : values;

  return (
    <FormDataWithModalProvider>
      {!rows || rows.length === 0 ? (
        <FormDataEmptyInfo />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormDataTable
              rowsTransform={rowsTransform}
              columns={columns}
              rows={rows}
              fieldName={fieldName}
            />
          </Grid>
          <Grid item xs={12}>
            <FormDataAddButton />
          </Grid>
        </Grid>
      )}
      <FormDataModal fieldName={fieldName}>
        <InnerForm />
      </FormDataModal>
    </FormDataWithModalProvider>
  );
}

export default FormDataArrayWithModal;
