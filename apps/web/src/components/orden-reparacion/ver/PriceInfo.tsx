"use client";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function PriceInfo({ ordenReparacion }: { ordenReparacion: any }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const ajustesPrecio = ordenReparacion.ajustesPrecio ?? [];
  const usesNewAjustes = ajustesPrecio.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <AttachMoneyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Facturacion Detallada
      </Typography>

      <Box sx={{ p: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableCell sx={{ fontWeight: 500 }}>Concepto</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  Subtotal
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  Repuestos (con el {ordenReparacion.porcentajeRecargo}% de
                  recargo)
                </TableCell>
                <TableCell align="right">
                  {getFormattedPrice(ordenReparacion.totalRepuestos)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Reparaciones / Repuestos de terceros (con el{" "}
                  {ordenReparacion.porcentajeRecargo}% de recargo)
                </TableCell>
                <TableCell align="right">
                  {getFormattedPrice(
                    ordenReparacion.totalReparacionesDeTerceros
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Mano de Obra
                </TableCell>
                <TableCell align="right">
                  {getFormattedPrice(ordenReparacion.totalManoDeObra)}
                </TableCell>
              </TableRow>

              {usesNewAjustes ? (
                <>
                  {ajustesPrecio.map((ajuste: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell component="th" scope="row">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {ajuste.descripcion}
                          <Chip
                            size="small"
                            label={
                              ajuste.esDescuento ? "Descuento" : "Incremento"
                            }
                            color={ajuste.esDescuento ? "error" : "success"}
                            variant="outlined"
                          />
                          {ajuste.tipo === "porcentual" && (
                            <Chip
                              size="small"
                              label={`${ajuste.monto}%`}
                              variant="outlined"
                            />
                          )}
                          {ajuste.esInterno && (
                            <Chip
                              size="small"
                              label="Interno"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {ajuste.esDescuento ? "- " : "+ "}
                        {ajuste.tipo === "porcentual"
                          ? `${ajuste.monto}%`
                          : getFormattedPrice(Number(ajuste.monto))}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Descuento
                      {ordenReparacion.descripcionDescuento && (
                        <>: {ordenReparacion.descripcionDescuento}</>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {getFormattedPrice(ordenReparacion.descuento)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Incremento
                      {ordenReparacion.descripcionIncremento && (
                        <>: {ordenReparacion.descripcionIncremento}</>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {getFormattedPrice(ordenReparacion.incremento)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Incremento Interno
                    </TableCell>
                    <TableCell align="right">
                      {getFormattedPrice(ordenReparacion.incrementoInterno)}
                    </TableCell>
                  </TableRow>
                </>
              )}

              <TableRow
                sx={{
                  backgroundColor: theme.palette.action.hover,
                  "& .MuiTableCell-root": {
                    fontWeight: 600,
                  },
                }}
              >
                <TableCell component="th" scope="row">
                  Total
                </TableCell>
                <TableCell align="right">
                  {getFormattedPrice(ordenReparacion.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}

export default PriceInfo;
