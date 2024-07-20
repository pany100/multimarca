import {
  Autocomplete,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useEffect, useRef, useState } from "react";

export interface FieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "select"
    | "multiselect"
    | "checkbox"
    | "date"
    | "number"
    | "autocomplete";
  options?: Record<string, string | number>[];
  valueKey?: string;
  labelKey?: string;
  searchOptions?: (query: string) => Promise<any[]>;
  getInitialValue?: (item: any) => { value: any; label: string };
}

interface DynamicFormProps<T> {
  item: T | null;
  fields: FieldConfig[];
  handleChange: (field: keyof T, value: any) => void;
}

function DynamicForm<T>({ item, fields, handleChange }: DynamicFormProps<T>) {
  const [autocompleteOptions, setAutocompleteOptions] = useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const initializedRef = useRef(false);

  const debouncedSearch = debounce(
    async (
      field: FieldConfig,
      query: string,
      callback: (options: { value: string; label: string }[]) => void
    ) => {
      if (field.searchOptions) {
        const options = await field.searchOptions(query);
        callback(options);
      }
    },
    300
  );
  useEffect(() => {
    if (item && !initializedRef.current) {
      // Cargar opciones iniciales para los campos de autocompletado
      fields.forEach((field) => {
        if (field.type === "autocomplete" && field.getInitialValue) {
          const initialValue = field.getInitialValue(item);
          if (initialValue) {
            setAutocompleteOptions((prev) => ({
              ...prev,
              [field.name]: [initialValue],
            }));
          }
        }
      });
      initializedRef.current = true;
    }
  }, [item, fields]);
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
          case "autocomplete":
            console.log(field.getInitialValue?.(item) || null);
            console.log(
              item?.[field.name as keyof T]
                ? autocompleteOptions[field.name]?.find(
                    (option) => option.value === item[field.name as keyof T]
                  ) || null
                : null
            );
            return (
              <Autocomplete
                options={autocompleteOptions[field.name] || []}
                getOptionLabel={(option) => option.label}
                value={
                  item?.[field.name as keyof T]
                    ? autocompleteOptions[field.name]?.find(
                        (option) => option.value === item[field.name as keyof T]
                      ) || null
                    : null
                }
                defaultValue={field.getInitialValue?.(item) || null}
                onChange={(_, newValue) =>
                  handleChange(field.name as keyof T, newValue?.value)
                }
                onInputChange={(_, newInputValue) => {
                  debouncedSearch(
                    field,
                    newInputValue,
                    (options: { value: string; label: string }[]) => {
                      setAutocompleteOptions((prev) => ({
                        ...prev,
                        [field.name]: options,
                      }));
                    }
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label={field.label} />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                loadingText="Buscando..."
                noOptionsText="No se encontraron resultados"
              />
            );
          case "multiselect":
            return (
              <FormControl key={field.name} fullWidth margin="normal">
                <InputLabel>{field.label}</InputLabel>
                <Select
                  multiple
                  value={item?.[field.name as keyof T] || []}
                  onChange={(e) =>
                    handleChange(field.name as keyof T, e.target.value)
                  }
                  renderValue={(selected) => (selected as string[]).join(", ")}
                >
                  {field.options?.map((option) => {
                    const value = option[field.valueKey || "id"];
                    const label = option[field.labelKey || "name"];
                    return (
                      <MenuItem key={option.id} value={value}>
                        <Checkbox
                          checked={
                            Array.isArray(item?.[field.name as keyof T]) &&
                            (item?.[field.name as keyof T] as any[]).some(
                              (itemValue) =>
                                itemValue.toString() === value.toString()
                            )
                          }
                        />
                        <ListItemText primary={label} />
                      </MenuItem>
                    );
                  })}
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
