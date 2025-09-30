import { Stack } from "@mui/material";
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dispatch, SetStateAction } from "react";

type Props = {
  setFrom: Dispatch<SetStateAction<Date | null>>;
  setTo: Dispatch<SetStateAction<Date | null>>;
};

function DateRangeSearch({ setFrom, setTo }: Props) {
  const handleDateChange = (
    value: PickerValue,
    context: PickerChangeHandlerContext<DateValidationError>,
    setDate: Dispatch<SetStateAction<Date | null>>
  ) => {
    if (context.validationError) {
      return; // No actualizar si hay error de validación
    }
    // Convertir el valor a Date si es necesario
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setDate(dateValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack direction="row" spacing={1} alignItems="center">
        <DatePicker
          label="Desde"
          onChange={(value, context) =>
            handleDateChange(value, context, setFrom)
          }
          format="dd-MM-yyyy"
          slotProps={{
            textField: {
              size: "small",
              sx: {
                width: 200,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                },
              },
            },
          }}
        />
        <DatePicker
          label="Hasta"
          onChange={(value, context) => handleDateChange(value, context, setTo)}
          format="dd-MM-yyyy"
          slotProps={{
            textField: {
              size: "small",
              sx: {
                width: 200,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                },
              },
            },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}

export default DateRangeSearch;
