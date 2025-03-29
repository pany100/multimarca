import { FormDataWithModalProvider } from "@/contexts/FormDataWithModalContext";
import { Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useFormContext } from "react-hook-form";
import FormDataModal from "./FormDataModal";
import FormDataTable from "./FormDataTable";

type Props = {
  fieldName: string;
  emptyContent: React.ComponentType<any>;
  form: React.ComponentType<any>;
  columns: GridColDef[];
  rowsTransform?: (row: any, index: number) => any;
};

function FormDataArrayWithModal({
  fieldName,
  emptyContent: EmptyContent,
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
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            border: "1px dashed #ccc",
            borderRadius: 1,
            mb: 2,
            backgroundColor: "action.hover",
          }}
        >
          <EmptyContent />
        </Box>
      ) : (
        <FormDataTable
          rowsTransform={rowsTransform}
          columns={columns}
          rows={rows}
          fieldName={fieldName}
        />
      )}
      <FormDataModal fieldName={fieldName}>
        <InnerForm />
      </FormDataModal>
    </FormDataWithModalProvider>
  );
}

export default FormDataArrayWithModal;
