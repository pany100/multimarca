import { yupResolver } from "@hookform/resolvers/yup";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import debounce from "lodash/debounce";
import React, { useEffect, useRef, useState } from "react";
import {
  Controller,
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  UseFormSetValue,
  useForm,
} from "react-hook-form";
import * as yup from "yup";
import ChequeForm from "./ChequeForm";

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
    | "autocomplete"
    | "tel"
    | "textarea"
    | "cheque"
    | "custom";
  options?:
    | Record<string, string | number>[]
    | ((data: any) => Record<string, string | number>[]);
  freeSolo?: boolean;
  valueKey?: string;
  labelKey?: string;
  searchOptions?: (query: string) => Promise<any[]>;
  getInitialValue?: (item: any) => { value: any; label: string };
  render?: (
    value: any,
    onChange: (value: any) => void,
    error: string | undefined
  ) => React.ReactNode;
  onChange?: (value: any, setValue: UseFormSetValue<any>) => void;
  hidden?: (item: any) => boolean;
  excludeFromSubmit?: boolean;
  layout?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  sourceField?: string;
}

interface DynamicFormProps<T> {
  item: T | null;
  fields: FieldConfig[];
  handleChange: (field: keyof T, value: any) => void;
  onSubmit: (data: T) => Promise<void>;
  validationSchema: yup.ObjectSchema<any>;
  cancel: () => void;
}

function DynamicForm<T extends FieldValues>({
  item,
  fields,
  handleChange,
  onSubmit,
  validationSchema,
  cancel,
}: DynamicFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<T>({
    resolver: yupResolver(validationSchema),
    defaultValues: (item || {}) as DefaultValues<T>,
    mode: "onChange",
  });
  const [autocompleteOptions, setAutocompleteOptions] = useState<
    Record<string, { value: string; label: string }[]>
  >({});

  console.log(watch());

  const handleFieldChange = (field: keyof T, value: any) => {
    handleChange(field, value);
    setValue(field as Path<T>, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    const fieldConfig = fields.find((f) => f.name === field);
    if (fieldConfig?.onChange) {
      fieldConfig.onChange(value, setValue);
    }
  };

  const onSubmitHandler: SubmitHandler<T> = async (data: any) => {
    const submitData = Object.keys(data).reduce((acc, key) => {
      const field = fields.find((f) => f.name === key);
      if (!field || !field.excludeFromSubmit) {
        acc[key as keyof T] = data[key as keyof T];
      }
      return acc;
    }, {} as T);
    await onSubmit(submitData as T);
  };

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

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case "custom":
        if (field.render) {
          return (
            <Controller
              key={field.name}
              name={field.name as Path<T>}
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  {field.render &&
                    field.render(
                      value,
                      (newValue) => {
                        onChange(newValue);
                        handleFieldChange(field.name as keyof T, newValue);
                      },
                      errors[field.name as Path<T>]?.message as
                        | string
                        | undefined
                    )}
                </div>
              )}
            />
          );
        }
        return null;
      case "date":
        return (
          <TextField
            key={field.name}
            fullWidth
            margin="normal"
            label={field.label}
            {...register(field.name as Path<T>)}
            error={!!errors[field.name as keyof T]}
            helperText={errors[field.name as keyof T]?.message as string}
            type="date"
            InputLabelProps={{ shrink: true }}
            value={
              item?.[field.name as keyof T]
                ? new Date(item[field.name as keyof T] as string)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            onChange={(e) =>
              handleFieldChange(field.name as keyof T, e.target.value)
            }
          />
        );
      case "tel":
        return (
          <TextField
            key={field.name}
            fullWidth
            margin="normal"
            label={field.label}
            {...register(field.name as Path<T>)}
            error={!!errors[field.name as keyof T]}
            helperText={errors[field.name as keyof T]?.message as string}
            type="tel"
            value={item?.[field.name as keyof T] || ""}
            onChange={(e) =>
              handleFieldChange(field.name as keyof T, e.target.value)
            }
            inputProps={{
              pattern: "[0-9]{9,12}", // Patrón para números de teléfono entre 9 y 12 dígitos
              inputMode: "numeric",
            }}
          />
        );
      case "select":
        return (
          <FormControl
            key={field.name}
            fullWidth
            margin="normal"
            error={!!errors[field.name as Path<T>]}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={
                item?.[field.name as keyof T] ||
                (field.getInitialValue && item
                  ? field.getInitialValue(item).value
                  : "")
              }
              {...register(field.name as Path<T>)}
              onChange={(e) =>
                handleFieldChange(field.name as keyof T, e.target.value)
              }
              label={field.label}
            >
              {!(
                typeof field.options === "function"
                  ? field.options(item)
                  : field.options
              )?.length ? (
                <MenuItem disabled value="">
                  No hay opciones disponibles
                </MenuItem>
              ) : (
                (typeof field.options === "function"
                  ? field.options(item)
                  : field.options
                )?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {errors[field.name as Path<T>]?.message as string}
            </FormHelperText>
          </FormControl>
        );
      case "autocomplete":
        return (
          <Controller
            name={field.name as Path<T>}
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  options={autocompleteOptions[field.name] || []}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option?.label || "";
                  }}
                  value={
                    value
                      ? autocompleteOptions[field.name]?.find(
                          (option) => option.value === value
                        ) || null
                      : null
                  }
                  freeSolo={field.freeSolo || false}
                  defaultValue={field.getInitialValue?.(item) || null}
                  onChange={(_, newValue) => {
                    let finalValue;
                    if (typeof newValue === "string") {
                      finalValue = newValue;
                    } else if (newValue && typeof newValue === "object") {
                      finalValue = newValue.value;
                    } else {
                      finalValue = "";
                    }
                    onChange(finalValue);
                    handleFieldChange(field.name as keyof T, finalValue);
                  }}
                  onInputChange={(_, newInputValue) => {
                    if (field.freeSolo) {
                      onChange(newInputValue);
                      handleFieldChange(field.name as keyof T, newInputValue);
                    }
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
                    <TextField
                      {...params}
                      label={field.label}
                      error={!!errors[field.name as Path<T>]}
                      helperText={
                        errors[field.name as Path<T>]?.message as string
                      }
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option?.value === value?.value
                  }
                  loadingText="Buscando..."
                  noOptionsText="No se encontraron resultados"
                />
              </FormControl>
            )}
          />
        );
      case "multiselect":
        return (
          <FormControl
            key={field.name}
            fullWidth
            margin="normal"
            error={!!errors[field.name as Path<T>]}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              {...register(field.name as Path<T>)}
              value={item?.[field.name as keyof T] || []}
              onChange={(e) =>
                handleFieldChange(field.name as keyof T, e.target.value)
              }
              label={field.label}
              renderValue={(selected) => {
                const selectedOptions = (
                  typeof field.options === "function"
                    ? field.options(item)
                    : field.options
                )?.filter((option: Record<string, string | number>) =>
                  (selected as any[]).includes(
                    option[field.valueKey || "value"]
                  )
                );
                return selectedOptions
                  ?.map(
                    (option: Record<string, string | number>) =>
                      option[field.labelKey || "label"]
                  )
                  .join(", ");
              }}
            >
              {(typeof field.options === "function"
                ? field.options(item)
                : field.options
              )?.map((option: Record<string, string | number>) => {
                const value = option[field.valueKey || "value"];
                const label = option[field.labelKey || "label"];
                return (
                  <MenuItem key={value} value={value}>
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
            <FormHelperText>
              {errors[field.name as Path<T>]?.message as string}
            </FormHelperText>
          </FormControl>
        );
      case "textarea":
        return (
          <TextField
            key={field.name}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            {...register(field.name as Path<T>)}
            error={!!errors[field.name as keyof T]}
            helperText={errors[field.name as keyof T]?.message as string}
            label={field.label}
            type={field.type}
            value={item?.[field.name as keyof T] || ""}
            onChange={(e) =>
              handleFieldChange(field.name as keyof T, e.target.value)
            }
          />
        );
      case "cheque":
        if (!field.sourceField) {
          return null;
        }
        return (
          <ChequeForm
            item={item}
            sourceField={field.sourceField}
            watch={watch}
            handleFieldChange={handleFieldChange}
            register={register}
            errors={errors}
          />
        );
      default:
        return (
          <TextField
            key={field.name}
            fullWidth
            margin="normal"
            {...register(field.name as Path<T>)}
            error={!!errors[field.name as keyof T]}
            helperText={errors[field.name as keyof T]?.message as string}
            label={field.label}
            type={field.type}
            value={item?.[field.name as keyof T] || ""}
            onChange={(e) =>
              handleFieldChange(field.name as keyof T, e.target.value)
            }
          />
        );
    }
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmitHandler)}
      sx={{ mt: 2 }}
    >
      <Grid container spacing={2}>
        {fields.map((field) => {
          if (field.hidden && typeof field.hidden === "function" && item) {
            if (field.hidden(item)) return null;
          }
          const gridProps = field.layout || { xs: 12 };
          return (
            <React.Fragment key={field.name}>
              <Grid item {...gridProps} sx={{ pt: "0 !important" }}>
                {renderField(field)}
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="outlined" onClick={() => cancel()} sx={{ mr: 1 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained">
          Guardar
        </Button>
      </Box>
    </Box>
  );
}

export default DynamicForm;
