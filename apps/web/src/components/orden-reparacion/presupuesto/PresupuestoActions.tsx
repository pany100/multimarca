import {
  getEstadoPresupuestoColor,
  getEstadoPresupuestoLabel,
} from "@/sections/ordenes-reparacion/admin/helpers/estadoHelpers";
import PrintIcon from "@mui/icons-material/Print";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Box, Button, Chip, Tooltip } from "@mui/material";

interface PresupuestoActionsProps {
  presupuesto: any;
  enviandoPresupuesto: boolean;
  whatsappLink: string;
  onEnviar: () => void;
  onPrint: () => void;
}

export const PresupuestoActions = ({
  presupuesto,
  enviandoPresupuesto,
  whatsappLink,
  onEnviar,
  onPrint,
}: PresupuestoActionsProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <Chip
        label={getEstadoPresupuestoLabel(presupuesto.estado)}
        color={getEstadoPresupuestoColor(presupuesto.estado)}
        size="medium"
        sx={{
          fontWeight: 500,
          px: 1,
          "& .MuiChip-label": {
            px: 1,
          },
        }}
      />

      {/* Enviar Presupuesto Button */}
      {presupuesto.estado === "Enviado" ? (
        <Tooltip title="Presupuesto ya enviado">
          <span>
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              disabled
              sx={{ textTransform: "none" }}
            >
              Presupuesto Enviado
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          startIcon={<SendIcon />}
          onClick={onEnviar}
          disabled={enviandoPresupuesto}
          sx={{ textTransform: "none" }}
        >
          {enviandoPresupuesto ? "Enviando..." : "Enviar Presupuesto"}
        </Button>
      )}

      {/* Print button */}
      <Button
        variant="outlined"
        color="primary"
        startIcon={<PrintIcon />}
        onClick={onPrint}
        sx={{ textTransform: "none" }}
      >
        Imprimir
      </Button>

      {/* WhatsApp button */}
      {whatsappLink && (
        <Button
          variant="outlined"
          color="success"
          startIcon={<WhatsAppIcon />}
          component="a"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textTransform: "none" }}
        >
          Enviar por WhatsApp
        </Button>
      )}
    </Box>
  );
};
