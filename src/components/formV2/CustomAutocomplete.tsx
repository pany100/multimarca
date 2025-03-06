import { Autocomplete, TextField, TextFieldProps } from "@mui/material";
import debounce from "lodash/debounce";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

export interface AutocompleteOption {
  label: string;
  value: string | number;
}

type Props = Omit<TextFieldProps, "onChange"> & {
  searchOptions: (query: string) => Promise<AutocompleteOption[]>;
  initialOptions: (id: string) => Promise<AutocompleteOption>;
};

const CustomAutocompleteInput = ({
  searchOptions,
  initialOptions,
  ...props
}: Props) => {
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext();

  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialOptions = async () => {
      setLoading(true);
      try {
        const initialValue = getValues(props.name as string);
        if (!initialValue) {
          return;
        }
        const option = await initialOptions(initialValue);
        setOptions([option]);
      } catch (error) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialOptions();
  }, []);

  const fetchOptions = debounce(async (query: string) => {
    setLoading(true);
    try {
      const results = await searchOptions(query);
      setOptions(results);
    } catch (error) {
      console.error("Error fetching options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  return (
    <Controller
      name={props.name as string}
      control={control}
      render={({ field: { onChange, value, ...field } }) => {
        const currentValue = value
          ? options.find((option) => option.value === value) || null
          : null;

        return (
          <Autocomplete
            {...field}
            options={options}
            loading={loading}
            value={currentValue}
            onChange={(_, newValue) => {
              onChange(newValue?.value);
            }}
            onInputChange={(_, newInputValue) => {
              if (newInputValue.length >= 2) {
                fetchOptions(newInputValue);
              } else {
                setOptions([]);
              }
            }}
            noOptionsText="No hay opciones"
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                {...props}
                error={!!errors[props.name as string]}
                helperText={errors[props.name as string]?.message?.toString()}
                label={props.label}
                fullWidth
              />
            )}
          />
        );
      }}
    />
  );
};

export default CustomAutocompleteInput;
