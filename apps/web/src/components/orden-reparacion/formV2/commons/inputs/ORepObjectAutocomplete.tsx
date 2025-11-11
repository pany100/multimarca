import { Autocomplete, FormControl, TextField } from "@mui/material";
import debounce from "lodash/debounce";
import { useEffect, useState } from "react";

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
  initialValue?: string;
};

function ORepObjectAutocomplete({
  label,
  searchOptions,
  selectOption,
  initialOptions,
  initialValue,
}: Props) {
  const [options, setOptions] = useState<AutocompleteObjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] =
    useState<AutocompleteObjectOption | null>(null);

  useEffect(() => {
    const fetchInitialOptions = async () => {
      setLoading(true);
      try {
        if (!initialValue) {
          return;
        }
        const option = await initialOptions(initialValue);
        setOptions([option]);
        setSelectedValue(option);
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
        value={selectedValue}
        loading={loading}
        onChange={(_, newValue) => {
          setSelectedValue(newValue);
          selectOption(newValue);
        }}
        onInputChange={(_, newInputValue) => {
          if (newInputValue.length >= 0) {
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
