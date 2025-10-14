import { FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import FilesInput from "./files/FilesInput";

type Props = {
  name: string;
  label: string;
};

function CustomFileInput({ name, label }: Props) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const value = watch(name);
  console.log(value);
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
