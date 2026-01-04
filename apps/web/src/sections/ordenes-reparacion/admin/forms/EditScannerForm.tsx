"use client";

import FilesInput from "@/components/formV2/files/FilesInput";
import { Grid } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type EditScannerFormProps = {
  onErrorUploading?: (error: string) => void;
};

function EditScannerForm({ onErrorUploading }: EditScannerFormProps) {
  const { control } = useFormContext();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Controller
          name="scannerFile"
          control={control}
          render={({ field }) => (
            <FilesInput
              label="Archivo Scanner"
              filePath={field.value || null}
              setFilePath={field.onChange}
              acceptedTypes="pdfs"
              onErrorUploading={onErrorUploading}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

export default EditScannerForm;
