import { Autocomplete, FormControl, TextField } from "@mui/material";
import debounce from "lodash/debounce";
import { useState } from "react";

export interface ObjectAutocomplete {
  object: any;
  value: string | number;
}

type Props = {
  searchOptions: (query: string) => Promise<ObjectAutocomplete[]>;
  selectOption: (option: ObjectAutocomplete | null) => void;
  getOptionLabel: (option: ObjectAutocomplete) => string;
  label: string;
};

function NonFormObjectAutocomplete({
  searchOptions,
  selectOption,
  getOptionLabel,
  label,
}: Props) {
  const [options, setOptions] = useState<ObjectAutocomplete[]>([]);
  const [loading, setLoading] = useState(false);

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
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => (
          <TextField {...params} label={label} fullWidth />
        )}
      />
    </FormControl>
  );
}

export default NonFormObjectAutocomplete;
