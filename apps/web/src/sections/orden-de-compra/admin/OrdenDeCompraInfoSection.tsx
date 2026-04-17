"use client";

import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { getFormattedDate } from "@/utils/fieldHelper";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useOrdenDeCompraContext } from "./contexts/OrdenDeCompraContext";

const schema = yup.object({
  fecha: yup.string().required("La fecha es requerida"),
  proveedorId: yup.number().required("El proveedor es requerido"),
});

type FormData = yup.InferType<typeof schema>;

const OrdenDeCompraInfoSection = () => {
  const { orden, setOrden } = useOrdenDeCompraContext();
  const { setSnackbar } = useSnackbarContext();
  const { authFetch } = useFetch();
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: orden.fecha
        ? orden.fecha.toString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      proveedorId: orden.proveedorId,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      fecha: orden.fecha
        ? orden.fecha.toString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      proveedorId: orden.proveedorId,
    });
  };

  const executeUpdate = async (data: FormData) => {
    const proveedorChanged = data.proveedorId !== orden.proveedorId;
    const items = orden.items || [];

    try {
      // Si cambió el proveedor y hay items, borrarlos primero
      if (proveedorChanged && items.length > 0) {
        for (const item of items) {
          await authFetch(
            `/api/orden-de-compra/${orden.id}/items/${item.id}`,
            { method: "DELETE" },
          );
        }
      }

      const response = await authFetch(`/api/orden-de-compra/${orden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: data.fecha,
          proveedorId: data.proveedorId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar");
      }

      const ordenActualizada = await response.json();
      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: proveedorChanged && items.length > 0
          ? "Proveedor actualizado. Se eliminaron los items anteriores."
          : "Información actualizada correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar la información",
        severity: "error",
      });
    }
  };

  const handleSubmit = async (data: FormData) => {
    const proveedorChanged = data.proveedorId !== orden.proveedorId;
    const hasItems = (orden.items || []).length > 0;

    if (proveedorChanged && hasItems) {
      setPendingData(data);
      return;
    }

    await executeUpdate(data);
  };

  const handleConfirmProveedorChange = async () => {
    if (pendingData) {
      await executeUpdate(pendingData);
      setPendingData(null);
    }
  };

  return (
    <>
      <CommonOrderCard
        title="Información General"
        formMethods={methods}
        onSubmit={handleSubmit}
        onOpen={handleOpenModal}
        loading={false}
        formContent={
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomInputText name="fecha" label="Fecha" type="date" />
            </Grid>
            <Grid item xs={12}>
              <CustomAutocompleteInput
                name="proveedorId"
                label="Proveedor"
                searchOptions={searchProveedores}
                initialOptions={initialProveedor}
              />
            </Grid>
          </Grid>
        }
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <StorefrontIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Proveedor
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium">
              {orden.proveedor?.name || "Sin proveedor"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Fecha
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium">
              {getFormattedDate(orden.fecha)}
            </Typography>
          </Grid>
        </Grid>
      </CommonOrderCard>

      <Dialog
        open={pendingData !== null}
        onClose={() => setPendingData(null)}
      >
        <DialogTitle>Cambiar proveedor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Al cambiar el proveedor se eliminarán todos los items cargados en
            la orden, ya que pertenecen al proveedor anterior. Deberá cargar
            los elementos de la orden nuevamente. ¿Desea continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingData(null)}>Cancelar</Button>
          <Button
            onClick={handleConfirmProveedorChange}
            color="error"
            variant="contained"
          >
            Cambiar proveedor y borrar items
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrdenDeCompraInfoSection;
