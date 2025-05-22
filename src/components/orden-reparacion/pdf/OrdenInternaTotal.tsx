import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

function OrdenInternaTotal({ repair }: { repair: any }) {
  const total = calcularTotalOrdenReparacion(repair);
  const aCuenta =
    repair.ingresos?.reduce(
      (acc: number, ingreso: any) => acc + Number(ingreso.monto),
      0
    ) || 0;
  const deuda = total - aCuenta;
  const paymentMethods = [
    "Efectivo",
    "Transferencia",
    "Crédito",
    "Débito",
    "Cheque",
  ];

  // Split payment methods into two columns
  const firstColumnMethods = paymentMethods.slice(0, 3); // First 3 methods
  const secondColumnMethods = paymentMethods.slice(3); // Remaining 2 methods

  return (
    <Paper elevation={0} sx={{ mt: 1, p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: 8, // Add significant gap between the sections
        }}
      >
        {/* Total amount on the left */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: "40%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mr: 1 }}>
                Total a pagar: $
                {total.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                A cuenta: $
                {aCuenta.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Resta: $
                {deuda.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Payment methods in two columns on the right */}
        <Box sx={{ minWidth: "40%" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Forma de pago:
          </Typography>
          <Grid container spacing={2}>
            {/* First column - 3 methods */}
            <Grid item>
              <Box>
                {firstColumnMethods.map((method) => (
                  <FormControlLabel
                    key={method}
                    control={<Checkbox />}
                    label={method}
                  />
                ))}
              </Box>
            </Grid>

            {/* Second column - 2 methods */}
            <Grid item>
              <Box>
                {secondColumnMethods.map((method) => (
                  <FormControlLabel
                    key={method}
                    control={<Checkbox />}
                    label={method}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}

export default OrdenInternaTotal;
