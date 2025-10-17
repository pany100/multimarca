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
  fromValue?: Date | null;
  toValue?: Date | null;
};

function DateRangeSearch({ setFrom, setTo, fromValue, toValue }: Props) {
  const handleDateChange = (
    value: PickerValue,
    context: PickerChangeHandlerContext<DateValidationError>,
    setDate: Dispatch<SetStateAction<Date | null>>
  ) => {
    if (context.validationError) {
      return; // No actualizar si hay error de validación
    }
    // Si el valor es null o undefined, establecer como null
    if (!value) {
      setDate(null);
      return;
    }
    // Convertir el valor a Date si es necesario
    const dateValue =
      value instanceof Date ? value : new Date(value.toString());
    setDate(dateValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack direction="row" spacing={1} alignItems="center">
        <DatePicker
          label="Desde"
          value={fromValue}
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
            actionBar: {
              actions: ['clear'],
            },
          }}
        />
        <DatePicker
          label="Hasta"
          value={toValue}
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
            actionBar: {
              actions: ['clear'],
            },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}

export default DateRangeSearch;
