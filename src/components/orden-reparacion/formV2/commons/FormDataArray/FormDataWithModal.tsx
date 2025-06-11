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
  validateForm?: (newItem: any) => Record<string, string> | null;
  children: React.ReactNode;
  extraContent?: React.ReactNode;
};

function FormDataArrayWithModal({
  fieldName,
  form: InnerForm,
  columns,
  rowsTransform,
  validateForm,
  children,
  extraContent,
}: Props) {
  const { watch } = useFormContext();

  const values = watch(fieldName);
  const rows = typeof values === "string" ? JSON.parse(values || "[]") : values;

  return (
    <FormDataWithModalProvider>
      {!rows || rows.length === 0 ? (
        <FormDataEmptyInfo>{children}</FormDataEmptyInfo>
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
          {extraContent && (
            <Grid item xs={12}>
              {extraContent}
            </Grid>
          )}
          <Grid item xs={12}>
            <FormDataAddButton />
          </Grid>
        </Grid>
      )}
      <FormDataModal fieldName={fieldName} validateForm={validateForm}>
        <InnerForm />
      </FormDataModal>
    </FormDataWithModalProvider>
  );
}

export default FormDataArrayWithModal;
