import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "select";
  options?: { id: number | string; name: string }[];
}

interface DynamicFormProps<T> {
  item: T | null;
  fields: FieldConfig[];
  handleChange: (field: keyof T, value: any) => void;
}

function DynamicForm<T>({ item, fields, handleChange }: DynamicFormProps<T>) {
  return (
    <>
      {fields.map((field) => {
        switch (field.type) {
          case "select":
            return (
              <FormControl key={field.name} fullWidth margin="normal">
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={item?.[field.name as keyof T] || ""}
                  onChange={(e) =>
                    handleChange(field.name as keyof T, e.target.value)
                  }
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          default:
            return (
              <TextField
                key={field.name}
                fullWidth
                margin="normal"
                label={field.label}
                type={field.type}
                value={item?.[field.name as keyof T] || ""}
                onChange={(e) =>
                  handleChange(field.name as keyof T, e.target.value)
                }
              />
            );
        }
      })}
    </>
  );
}

export default DynamicForm;
