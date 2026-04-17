import { FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import FilesInput from "./files/FilesInput";

type Props = {
  name: string;
  label: string;
  /** Override the accept attribute on the file input (e.g. ".pdf,.doc,.docx") */
  accept?: string;
};

function CustomFileInput({ name, label, accept }: Props) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const value = watch(name);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <>
          <FilesInput
            label={label}
            filePath={value || null}
            setFilePath={(fileUrl) => onChange(fileUrl)}
            accept={accept}
          />
          {errors[name] && (
            <FormHelperText error sx={{ mt: 1 }}>
              {errors[name]?.message?.toString()}
            </FormHelperText>
          )}
        </>
      )}
    />
  );
}

export default CustomFileInput;
