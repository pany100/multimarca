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
  isSticky?: boolean;
  onEnviar: () => void;
  onPrint: () => void;
}

export const PresupuestoActions = ({
  presupuesto,
  enviandoPresupuesto,
  whatsappLink,
  isSticky = false,
  onEnviar,
  onPrint,
}: PresupuestoActionsProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isSticky ? 0.5 : 1,
        flexWrap: "wrap",
      }}
    >
      <Chip
        label={getEstadoPresupuestoLabel(presupuesto.estado)}
        color={getEstadoPresupuestoColor(presupuesto.estado)}
        size={isSticky ? "small" : "medium"}
        sx={{
          fontWeight: 500,
          px: isSticky ? 0.5 : 1,
          "& .MuiChip-label": {
            px: isSticky ? 0.5 : 1,
          },
        }}
      />

      {/* Enviar Presupuesto Button */}
      {presupuesto.estado === "Enviado" ? (
        <Tooltip title="Presupuesto ya enviado">
          <span>
            <Button
              variant="outlined"
              size={isSticky ? "small" : "medium"}
              startIcon={!isSticky && <SendIcon />}
              disabled
              sx={{
                textTransform: "none",
                minWidth: isSticky ? "auto" : undefined,
              }}
            >
              {isSticky ? <SendIcon fontSize="small" /> : "Presupuesto Enviado"}
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          size={isSticky ? "small" : "medium"}
          startIcon={!isSticky && <SendIcon />}
          onClick={onEnviar}
          disabled={enviandoPresupuesto}
          sx={{
            textTransform: "none",
            minWidth: isSticky ? "auto" : undefined,
          }}
        >
          {enviandoPresupuesto ? (
            "..."
          ) : isSticky ? (
            <SendIcon fontSize="small" />
          ) : (
            "Enviar Presupuesto"
          )}
        </Button>
      )}

      {/* Print button */}
      <Button
        variant="outlined"
        color="primary"
        size={isSticky ? "small" : "medium"}
        startIcon={!isSticky && <PrintIcon />}
        onClick={onPrint}
        sx={{ textTransform: "none", minWidth: isSticky ? "auto" : undefined }}
      >
        {isSticky ? <PrintIcon fontSize="small" /> : "Imprimir"}
      </Button>

      {/* WhatsApp button */}
      {whatsappLink && (
        <Button
          variant="outlined"
          color="success"
          size={isSticky ? "small" : "medium"}
          startIcon={!isSticky && <WhatsAppIcon />}
          component="a"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textTransform: "none",
            minWidth: isSticky ? "auto" : undefined,
          }}
          disabled
        >
          {isSticky ? <WhatsAppIcon fontSize="small" /> : "Enviar por WhatsApp"}
        </Button>
      )}
    </Box>
  );
};
