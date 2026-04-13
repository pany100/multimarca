"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useOrden } from "../contexts/OrdenContext";
import EditCostosForm from "../forms/EditCostosForm";
import { useUpdateCostos } from "../hooks/useUpdateCostos";
import { CommonOrderCard } from "./CommonOrderCard";

const fmt = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const schema = yup.object({
  incrementoInterno: yup
    .number()
    .nullable()
    .min(0)
    .typeError("Debe ser un numero")
    .optional(),
  descuento: yup
    .number()
    .nullable()
    .min(0)
    .typeError("Debe ser un numero")
    .optional(),
  descripcionDescuento: yup.string().nullable().optional(),
  incremento: yup
    .number()
    .nullable()
    .min(0)
    .typeError("Debe ser un numero")
    .optional(),
  descripcionIncremento: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

/** A single line in the "cuenta" */
function LineItem({
  label,
  amount,
  sign,
  color,
  sub,
  badge,
}: {
  label: string;
  amount: string;
  sign?: "+" | "-";
  color?: string;
  sub?: string;
  badge?: string;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 0.3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {badge && (
            <Chip
              size="small"
              label={badge}
              color="warning"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: 500,
            color: color ?? "text.secondary",
            whiteSpace: "nowrap",
          }}
        >
          {sign ? `${sign} ` : ""}$ {amount}
        </Typography>
      </Box>
      {sub && (
        <Typography variant="caption" color="text.disabled" sx={{ pl: 1 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

function CostosSection() {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateCostos, loading } = useUpdateCostos();

  const hasLegacy =
    Number(orden.incrementoInterno ?? 0) > 0 ||
    Number(orden.descuento ?? 0) > 0 ||
    Number(orden.incremento ?? 0) > 0;

  const ajustesPrecio = orden.ajustesPrecio ?? [];

  const precioFinalLocal =
    Number(orden.totalReparacionesDeTerceros ?? 0) +
    Number(orden.totalRepuestos ?? 0) +
    Number(orden.totalManoDeObra ?? 0) +
    Number(orden.incrementoInterno ?? 0) -
    Number(orden.descuento ?? 0) +
    Number(orden.incremento ?? 0);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      incrementoInterno: orden.incrementoInterno ?? null,
      descuento: orden.descuento ?? null,
      descripcionDescuento: orden.descripcionDescuento ?? null,
      incremento: orden.incremento ?? null,
      descripcionIncremento: orden.descripcionIncremento ?? null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      incrementoInterno: orden.incrementoInterno ?? null,
      descuento: orden.descuento ?? null,
      descripcionDescuento: orden.descripcionDescuento ?? null,
      incremento: orden.incremento ?? null,
      descripcionIncremento: orden.descripcionIncremento ?? null,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateCostos(orden.id, data);
      setOrden(ordenActualizada);
      setSnackbar({
        open: true,
        message: "Costos actualizados correctamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar los costos",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Resumen de Costos"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditCostosForm />}
      maxWidth="md"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* --- Base items --- */}
        <LineItem
          label="Reparaciones de terceros"
          amount={fmt(orden.totalReparacionesDeTerceros)}
        />
        <LineItem label="Repuestos" amount={fmt(orden.totalRepuestos)} />
        <LineItem label="Mano de obra" amount={fmt(orden.totalManoDeObra)} />

        {/* --- Legacy (deprecado) --- */}
        {hasLegacy && (
          <>
            {Number(orden.incrementoInterno ?? 0) > 0 && (
              <LineItem
                label="Incremento Interno"
                amount={fmt(orden.incrementoInterno)}
                sign="+"
                color="success.main"
                badge="Deprecado"
              />
            )}
            {Number(orden.descuento ?? 0) > 0 && (
              <LineItem
                label="Descuento"
                amount={fmt(orden.descuento)}
                sign="-"
                color="error.main"
                sub={orden.descripcionDescuento || undefined}
                badge="Deprecado"
              />
            )}
            {Number(orden.incremento ?? 0) > 0 && (
              <LineItem
                label="Incremento"
                amount={fmt(orden.incremento)}
                sign="+"
                color="success.main"
                sub={orden.descripcionIncremento || undefined}
                badge="Deprecado"
              />
            )}
          </>
        )}

        {/* --- Precio Final Local (base + legacy, antes de ajustes nuevos) --- */}
        {(ajustesPrecio.length > 0 || hasLegacy) && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.3,
              }}
            >
              <Typography variant="body2" fontWeight="bold" color="text.secondary">
                Precio Final Local
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                $ {fmt(precioFinalLocal)}
              </Typography>
            </Box>
          </>
        )}

        {/* --- New ajustes --- */}
        {ajustesPrecio.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              sx={{ mb: 0.25 }}
            >
              Ajustes
            </Typography>
            {ajustesPrecio.map((a: any) => {
              const isDiscount = a.esDescuento;
              const isPorcentual = a.tipo === "porcentual";
              const montoEfectivo = isPorcentual
                ? (Number(a.monto) / 100) * precioFinalLocal
                : Number(a.monto);
              const label = isPorcentual
                ? `${a.descripcion} (${Number(a.monto)}%)`
                : a.descripcion;
              return (
                <LineItem
                  key={a.id}
                  label={label}
                  amount={fmt(montoEfectivo)}
                  sign={isDiscount ? "-" : "+"}
                  color={isDiscount ? "error.main" : "success.main"}
                  badge={a.esInterno ? "Oculto" : undefined}
                />
              );
            })}
          </>
        )}

        {/* --- Total --- */}
        <Paper
          elevation={0}
          sx={{
            mt: 1,
            p: 1.5,
            backgroundColor: "primary.lighter",
            borderRadius: 1,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold" color="primary.dark">
              Total
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="primary.dark"
              sx={{ fontFamily: "monospace" }}
            >
              $ {fmt(orden.total)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </CommonOrderCard>
  );
}

export default CostosSection;
