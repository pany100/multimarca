import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";

type Props = {
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
};

function NonFormSelect({ options, onChange, label }: Props) {
  const [value, setValue] = useState<string | null>("");

  return (
    <FormControl fullWidth sx={{ mt: 1 }}>
      <InputLabel id={label}>{label}</InputLabel>
      <Select
        labelId={label}
        label={label}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value as string);
        }}
      >
        {options.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default NonFormSelect;
