import { TextField } from "@mui/material";

type Props = {
  label: string;
  type: string;
  onChange: (value: string) => void;
};

const NonFormInput = ({ label, type, onChange }: Props) => {
  return (
    <TextField
      label={label}
      type={type}
      fullWidth
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default NonFormInput;
