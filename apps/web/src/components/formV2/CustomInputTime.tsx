import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Controller, useFormContext } from "react-hook-form";

interface CustomInputTimeProps {
  name: string;
  label: string;
  minTime: string; // format: "HH:mm"
  maxTime: string; // format: "HH:mm"
  minutesStep?: number;
}

const CustomInputTime = ({
  name,
  label,
  minTime = "08:00",
  maxTime = "17:00",
  minutesStep = 30,
}: CustomInputTimeProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const parseTimeString = (timeStr: string) => {
    if (!timeStr) return undefined;
    return parse(timeStr, "HH:mm", new Date());
  };

  const minDate = parseTimeString(minTime);
  const maxDate = parseTimeString(maxTime);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <TimePicker
            label={label}
            value={value ? parseTimeString(value) : null}
            onChange={(newValue) => {
              if (!newValue) {
                onChange(null);
                return;
              }
              // Ensure we're working with a Date object
              const dateValue =
                newValue instanceof Date ? newValue : newValue.toDate();
              onChange(format(dateValue, "HH:mm"));
            }}
            minutesStep={minutesStep}
            minTime={minDate}
            maxTime={maxDate}
            ampm={false}
            skipDisabled
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors[name],
                helperText: errors[name]?.message?.toString(),
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default CustomInputTime;
