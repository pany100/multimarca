import { useFeriados } from "@/sections/feriados/hooks/useFeriados";
import { TextFieldProps } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Controller, useFormContext } from "react-hook-form";

interface CustomInputDateProps extends Omit<TextFieldProps, "type"> {
  name: string;
  minDate?: Date;
  maxDate?: Date;
}

const CustomInputDate = ({
  name,
  minDate,
  maxDate,
  ...props
}: CustomInputDateProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { isFeriado } = useFeriados();

  const today = dayjs().startOf("day");

  const shouldDisableDate = (date: Date | dayjs.Dayjs) => {
    const dateAsDayjs = dayjs(date);

    // Disable past dates
    if (dateAsDayjs.isBefore(today)) {
      return true;
    }

    // Check if it's a holiday
    return isFeriado(dateAsDayjs.toDate());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <DatePicker
            {...field}
            value={value ? dayjs(value) : null}
            onChange={(newValue) => {
              if (!newValue) {
                onChange(null);
                return;
              }
              // Ensure we're working with a Dayjs object
              const date = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue);
              onChange(date.format("YYYY-MM-DD"));
            }}
            minDate={minDate ? dayjs(minDate) : undefined}
            maxDate={maxDate ? dayjs(maxDate) : undefined}
            shouldDisableDate={shouldDisableDate}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors[name],
                helperText: errors[name]?.message?.toString(),
                ...props,
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default CustomInputDate;
