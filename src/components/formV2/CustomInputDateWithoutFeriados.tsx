"use client";

import useFeriados from "@/sections/feriados/hooks/useFeriados";
import { TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

interface Props {
  name: string;
  label: string;
  InputLabelProps?: any;
  [key: string]: any;
}

const CustomInputDateWithoutFeriados = (props: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { isFeriado } = useFeriados();

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { value, ...field } }) => (
        <TextField
          {...field}
          value={value ? new Date(value).toISOString().split("T")[0] : ""}
          type="date"
          fullWidth
          error={!!errors[props.name as string]}
          helperText={errors[props.name as string]?.message?.toString()}
          InputLabelProps={{
            ...props.InputLabelProps,
            shrink: true,
          }}
          inputProps={{
            ...props.inputProps,
            min: new Date().toISOString().split("T")[0],
            onKeyDown: (e) => e.preventDefault(),
            onChange: (e: any) => {
              const date = new Date(e.target.value);
              const day = date.getDay();
              const isWeekend = day === 0 || day === 6;

              if (!isWeekend && !isFeriado(date)) {
                field.onChange(e);
              }
            },
          }}
          {...props}
        />
      )}
    />
  );
};

export default CustomInputDateWithoutFeriados;
