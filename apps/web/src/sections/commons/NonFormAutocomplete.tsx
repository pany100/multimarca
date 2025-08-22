import { AutocompleteOption } from "@/components/formV2/CustomAutocomplete";
import { Autocomplete, FormControl, TextField } from "@mui/material";
import debounce from "lodash/debounce";
import { useState } from "react";

type Props = {
  searchOptions: (query: string) => Promise<AutocompleteOption[]>;
  selectOption: (option: AutocompleteOption | null) => void;
  label: string;
};

function NonFormAutocomplete({ searchOptions, selectOption, label }: Props) {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
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

export default NonFormAutocomplete;
