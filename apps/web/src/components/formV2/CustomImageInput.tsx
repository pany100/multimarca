import { FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import ImageInput from "../ImageInput";

type Props = {
  name: string;
  label: string;
};

function CustomImageInput({ name, label }: Props) {
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
          <ImageInput
            label={label}
            image={value || null}
            setImage={(imageUrl) => onChange(imageUrl)}
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

export default CustomImageInput;
