"use client";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  calcularManoDeObra,
  calcularTotalOrdenReparacion,
  calcularTotalReparacionesTerceros,
  calcularTotalRepuestos,
} from "@/utils/ordenHelper";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

function PriceInfo({ ordenReparacion }: { ordenReparacion: any }) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        <AttachMoneyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Facturación Detallada
      </Typography>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Concepto</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Repuestos</TableCell>
              <TableCell align="right">
                {getFormattedPrice(calcularTotalRepuestos(ordenReparacion))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reparaciones / Repuestos de terceros</TableCell>
              <TableCell align="right">
                {getFormattedPrice(
                  calcularTotalReparacionesTerceros(ordenReparacion)
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Mano de Obra</TableCell>
              <TableCell align="right">
                {getFormattedPrice(
                  calcularManoDeObra(ordenReparacion.trabajosRealizados)
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
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
              <TableCell>
                <strong>Total</strong>
              </TableCell>
              <TableCell align="right">
                <strong>
                  {getFormattedPrice(
                    calcularTotalOrdenReparacion(ordenReparacion)
                  )}
                </strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default PriceInfo;
