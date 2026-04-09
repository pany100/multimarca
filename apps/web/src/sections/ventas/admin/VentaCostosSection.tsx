"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "../../ordenes-reparacion/admin/components/CommonOrderCard";
import { useVentaRequired } from "./contexts/VentaContext";
import EditCostosVentaForm from "./forms/EditCostosVentaForm";
import { useUpdateCostosVenta } from "./hooks/useUpdateCostosVenta";

const formatPrecio = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ajusteItemSchema = yup.object({
  descripcion: yup.string().required("La descripcion es requerida"),
  monto: yup
    .number()
    .positive("El monto debe ser positivo")
    .required("El monto es requerido"),
  tipo: yup.string().oneOf(["porcentual", "fijo"]).required(),
  esDescuento: yup.boolean().required(),
  esInterno: yup.boolean().default(false),
  orden: yup.number().integer().default(0),
});

const schema = yup.object({
  ajustesPrecio: yup.array().of(ajusteItemSchema).default([]),
  modoAjustes: yup
    .string()
    .oneOf(["acumulativo", "sobreTotalBase"])
    .default("sobreTotalBase"),
});

type FormData = yup.InferType<typeof schema>;

function VentaCostosSection() {
  const { venta, setVenta } = useVentaRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updateCostos, loading } = useUpdateCostosVenta();

  const ajustesPrecio = venta.ajustesPrecio ?? [];
  const usesNewAjustes = ajustesPrecio.length > 0;

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      ajustesPrecio: ajustesPrecio.map((a: any) => ({
        descripcion: a.descripcion,
        monto: Number(a.monto),
        tipo: a.tipo,
        esDescuento: a.esDescuento,
        esInterno: a.esInterno ?? false,
        orden: a.orden ?? 0,
      })),
      modoAjustes: venta.modoAjustes || "sobreTotalBase",
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      ajustesPrecio: (venta.ajustesPrecio ?? []).map((a: any) => ({
        descripcion: a.descripcion,
        monto: Number(a.monto),
        tipo: a.tipo,
        esDescuento: a.esDescuento,
        esInterno: a.esInterno ?? false,
        orden: a.orden ?? 0,
      })),
      modoAjustes: venta.modoAjustes || "sobreTotalBase",
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ventaActualizada = await updateCostos(venta.id, {
        ajustesPrecio: (data.ajustesPrecio ?? []).map((a, idx) => ({
          descripcion: a.descripcion!,
          monto: a.monto!,
          tipo: a.tipo! as "porcentual" | "fijo",
          esDescuento: a.esDescuento!,
          esInterno: a.esInterno ?? false,
          orden: a.orden ?? idx,
        })),
        modoAjustes: data.modoAjustes as "acumulativo" | "sobreTotalBase",
      });

      setVenta(ventaActualizada);

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
      title="Costos"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditCostosVentaForm />}
      maxWidth="md"
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <AttachMoneyIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Stack spacing={1} flex={1}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Reparaciones de terceros:</strong> $
              {formatPrecio(venta.totalReparacionesDeTerceros)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Repuestos:</strong> $
              {formatPrecio(venta.totalRepuestos)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Mano de obra:</strong> $
              {formatPrecio(venta.totalManoDeObra)}
            </Typography>
          </Box>

          {usesNewAjustes ? (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                <strong>Ajustes de precio:</strong>
              </Typography>
              {ajustesPrecio.map((a: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {a.descripcion}
                  </Typography>
                  <Chip
                    size="small"
                    label={a.esDescuento ? "Descuento" : "Incremento"}
                    color={a.esDescuento ? "error" : "success"}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {a.tipo === "porcentual"
                      ? `${Number(a.monto)}%`
                      : `$${formatPrecio(a.monto)}`}
                  </Typography>
                  {a.esInterno && (
                    <Chip
                      size="small"
                      label="Interno"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              ))}
            </>
          ) : (
            <>
              {Number(venta.descuento ?? 0) > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Descuento:</strong> ${" "}
                    {formatPrecio(venta.descuento)}
                  </Typography>
                  {venta.descripcionDescuento && (
                    <Typography variant="caption" color="text.disabled">
                      {venta.descripcionDescuento}
                    </Typography>
                  )}
                </Box>
              )}
              {Number(venta.incremento ?? 0) > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Incremento:</strong> ${" "}
                    {formatPrecio(venta.incremento)}
                  </Typography>
                  {venta.descripcionIncremento && (
                    <Typography variant="caption" color="text.disabled">
                      {venta.descripcionIncremento}
                    </Typography>
                  )}
                </Box>
              )}
              {Number(venta.descuento ?? 0) === 0 &&
                Number(venta.incremento ?? 0) === 0 && (
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    fontStyle="italic"
                  >
                    No hay costos adicionales configurados
                  </Typography>
                )}
            </>
          )}

          <Paper
            elevation={0}
            sx={{
              mt: 2,
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
                Total Venta
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="primary.dark"
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                $ {formatPrecio(venta.total)}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </CommonOrderCard>
  );
}

export default VentaCostosSection;
