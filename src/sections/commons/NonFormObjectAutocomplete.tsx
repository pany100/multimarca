import { Autocomplete, FormControl, TextField } from "@mui/material";
import debounce from "lodash/debounce";
import { useEffect, useState } from "react";

export interface ObjectAutocomplete {
  object: any;
  value: string | number;
}

type Props = {
  searchOptions: (query: string) => Promise<ObjectAutocomplete[]>;
  selectOption: (option: ObjectAutocomplete | null) => void;
  getOptionLabel: (option: ObjectAutocomplete) => string;
  initialValue?: string | number;
  initialOptions: (id: string) => Promise<ObjectAutocomplete>;
  label: string;
};

function NonFormObjectAutocomplete({
  searchOptions,
  initialOptions,
  selectOption,
  getOptionLabel,
  initialValue,
  label,
}: Props) {
  const [options, setOptions] = useState<ObjectAutocomplete[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialOptions = async () => {
      setLoading(true);
      try {
        if (!initialValue) {
          return;
        }
        console.log(initialValue);
        const option = await initialOptions(initialValue.toString());
        console.log(option);
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
    <FormControl fullWidth sx={{ mt: 1 }}>
      <Autocomplete
        options={options}
        loading={loading}
        onChange={(_, newValue) => {
          selectOption(newValue);
        }}
        onInputChange={(_, newInputValue) => {
          if (newInputValue.length >= 2) {
            fetchOptions(newInputValue);
          } else {
            setOptions([]);
          }
        }}
        noOptionsText="No hay opciones"
        isOptionEqualToValue={(option, value) => {
          console.log("IS QUEAL");
          console.log(option);
          console.log(value);
          return option.value === value.value;
        }}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => (
          <TextField {...params} label={label} fullWidth />
        )}
      />
    </FormControl>
  );
}

export default NonFormObjectAutocomplete;
