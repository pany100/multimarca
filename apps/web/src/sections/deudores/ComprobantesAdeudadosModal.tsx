"use client";

import { ComprobanteAdeudado } from "@/hooks/deudores/useDeudores";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  clienteNombre: string;
  comprobantes: ComprobanteAdeudado[];
}

const tipoLabel: Record<ComprobanteAdeudado["tipo"], string> = {
  orden_reparacion: "Orden de reparación",
  venta: "Venta",
};

const tipoPath: Record<ComprobanteAdeudado["tipo"], string> = {
  orden_reparacion: "/dashboard/ordenes-reparacion",
  venta: "/dashboard/ventas",
};

function formatFechaAR(value: string | null | undefined): string {
  if (!value) return "-";
  const match = String(value).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "-";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function ComprobantesAdeudadosModal({
  open,
  onClose,
  clienteNombre,
  comprobantes,
}: Props) {
  const router = useRouter();

  const handleRowClick = (comprobante: ComprobanteAdeudado) => {
    router.push(`${tipoPath[comprobante.tipo]}/${comprobante.id}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span>Comprobantes adeudados — {clienteNombre}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {comprobantes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay comprobantes adeudados.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>N°</TableCell>
                <TableCell>Patente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Pendiente</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comprobantes.map((c) => (
                <TableRow
                  key={`${c.tipo}-${c.id}`}
                  hover
                  onClick={() => handleRowClick(c)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{tipoLabel[c.tipo]}</TableCell>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.patente || "-"}</TableCell>
                  <TableCell>{formatFechaAR(c.fecha)}</TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: "bold" }}>
                      {getFormattedPrice(c.pendiente)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: "bold" }}>
                    {getFormattedPrice(
                      comprobantes.reduce((sum, c) => sum + Number(c.pendiente), 0)
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ComprobantesAdeudadosModal;
