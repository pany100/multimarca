import { Autocomplete, FormControl, TextField } from "@mui/material";
import debounce from "lodash/debounce";
import { useState } from "react";

export interface AutocompleteObjectOption {
  label: string;
  value: string | number;
  object: any;
}

type Props = {
  label: string;
  searchOptions: (query: string) => Promise<AutocompleteObjectOption[]>;
  initialOptions: (id: string) => Promise<AutocompleteObjectOption>;
  selectOption: (option: AutocompleteObjectOption | null) => void;
};

function ORepObjectAutocomplete({
  label,
  searchOptions,
  selectOption,
  initialOptions,
}: Props) {
  const [options, setOptions] = useState<AutocompleteObjectOption[]>([]);
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
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField {...params} label={label} fullWidth />
        )}
      />
    </FormControl>
  );
}

export default ORepObjectAutocomplete;
