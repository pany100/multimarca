"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

const CustomInputPassword = (props: TextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { type: _type, InputProps: _InputProps, ...restProps } = props;
  void _type;
  void _InputProps;

  return (
    <Controller
      name={props.name as string}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <TextField
          {...field}
          {...restProps}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          type={showPassword ? "text" : "password"}
          fullWidth
          error={!!errors[props.name as string]}
          helperText={errors[props.name as string]?.message?.toString()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

export default CustomInputPassword;
