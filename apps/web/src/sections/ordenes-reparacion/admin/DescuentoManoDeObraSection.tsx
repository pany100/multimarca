"use client";

import { getFormattedPrice } from "@/utils/fieldHelper";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { Box, Chip, Divider, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { CommonOrderCard } from "./components/CommonOrderCard";

interface FormData {
  descuentoParaManoDeObra: number;
}

interface DescuentoManoDeObraSectionProps {
  descuentoParaManoDeObra: number;
  totalManoDeObraSinIva: number;
  onSave: (value: number) => Promise<void>;
  loading?: boolean;
}

function DescuentoManoDeObraSection({
  descuentoParaManoDeObra,
  totalManoDeObraSinIva,
  onSave,
  loading = false,
}: DescuentoManoDeObraSectionProps) {
  const methods = useForm<FormData>({
    defaultValues: {
      descuentoParaManoDeObra: descuentoParaManoDeObra ?? 0,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      descuentoParaManoDeObra: descuentoParaManoDeObra ?? 0,
    });
  };

  const handleSubmit = async (data: FormData) => {
    await onSave(data.descuentoParaManoDeObra ?? 0);
  };

  const manoDeObraAPagar = Math.max(
    totalManoDeObraSinIva - descuentoParaManoDeObra,
    0,
  );

  return (
    <CommonOrderCard
      title="Descuento de mano de obra al mecánico"
      modalTitle="Editar descuento de mano de obra al mecánico"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      dense
      formContent={
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Este descuento se aplica únicamente al cálculo de la mano de obra a
            pagar al mecánico en la sección de gastos. No modifica el precio que
            paga el cliente ni aparece en ningún PDF o recibo.
          </Typography>
          <TextField
            {...methods.register("descuentoParaManoDeObra", {
              valueAsNumber: true,
            })}
            label="Monto del descuento"
            type="number"
            fullWidth
            size="small"
            inputProps={{ min: 0, step: "any" }}
          />
        </Box>
      }
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <ContentCutIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Box flex={1}>
          {/* Valor editable — el lápiz del header edita este campo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Typography variant="body1" fontWeight={600}>
              {getFormattedPrice(descuentoParaManoDeObra)}
            </Typography>
            {descuentoParaManoDeObra > 0 ? (
              <Chip label="Descuento activo" size="small" color="warning" />
            ) : (
              <Chip
                label="Sin descuento"
                size="small"
                variant="outlined"
                sx={{ color: "text.disabled", borderColor: "divider" }}
              />
            )}
          </Box>

          {/* Desglose */}
          <Box
            sx={{
              backgroundColor: "action.hover",
              borderRadius: 1,
              px: 2,
              py: 1.5,
            }}
          >
            <Row
              label="Mano de obra total (sin IVA)"
              value={getFormattedPrice(totalManoDeObraSinIva)}
            />
            <Row
              label="Descuento"
              value={
                descuentoParaManoDeObra > 0
                  ? `- ${getFormattedPrice(descuentoParaManoDeObra)}`
                  : getFormattedPrice(0)
              }
              color={descuentoParaManoDeObra > 0 ? "error.main" : undefined}
            />
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                A pagar al mecánico
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {getFormattedPrice(manoDeObraAPagar)}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ mt: 1, display: "block" }}
          >
            Solo afecta el cálculo en la sección de gastos. No modifica el
            precio al cliente.
          </Typography>
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.25,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" color={color || "text.secondary"}>
        {value}
      </Typography>
    </Box>
  );
}

export default DescuentoManoDeObraSection;
