import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

type Props = {
  setMes: Dispatch<SetStateAction<string>>;
  setAnio: Dispatch<SetStateAction<string>>;
};

function DateRangeSearch({ setMes, setAnio }: Props) {
  const meses = [
    { valor: "1", nombre: "Enero" },
    { valor: "2", nombre: "Febrero" },
    { valor: "3", nombre: "Marzo" },
    { valor: "4", nombre: "Abril" },
    { valor: "5", nombre: "Mayo" },
    { valor: "6", nombre: "Junio" },
    { valor: "7", nombre: "Julio" },
    { valor: "8", nombre: "Agosto" },
    { valor: "9", nombre: "Septiembre" },
    { valor: "10", nombre: "Octubre" },
    { valor: "11", nombre: "Noviembre" },
    { valor: "12", nombre: "Diciembre" },
  ];
  return (
    <>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Mes</InputLabel>
          <Select
            label="Mes"
            onChange={(e) => setMes(e.target.value as string)}
          >
            <MenuItem value="">
              <em>Todos los meses</em>
            </MenuItem>
            {meses.map((mes) => (
              <MenuItem key={mes.valor} value={mes.valor}>
                {mes.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="Año"
          type="number"
          onChange={(e) => setAnio(e.target.value)}
          fullWidth
          size="small"
        />
      </Grid>
    </>
  );
}

export default DateRangeSearch;
