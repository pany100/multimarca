"use client";

import CommonModalForm from "@/components/commons/CommonModalForm";
import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useCreateDraftOrdenDeCompra } from "../hooks/useCreateDraftOrdenDeCompra";

const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  proveedorId: yup.number().required("El proveedor es requerido"),
});

type FormData = yup.InferType<typeof schema>;

interface NuevaOrdenDeCompraModalProps {
  refreshTable?: () => void;
}

const NuevaOrdenDeCompraModal = ({
  refreshTable,
}: NuevaOrdenDeCompraModalProps) => {
  const { isOpen, hideModal } = useGlobalModal();
  const { setSnackbar } = useSnackbarContext();
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();
  const { createDraft, loading } = useCreateDraftOrdenDeCompra();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: new Date() as any,
      proveedorId: undefined,
    },
  });

  const handleClose = () => {
    methods.reset();
    hideModal();
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await createDraft({
        fecha: new Date(data.fecha).toISOString(),
        proveedorId: data.proveedorId,
      });

      setSnackbar({
        message: "Orden de compra creada exitosamente",
        severity: "success",
        open: true,
      });

      if (refreshTable) {
        refreshTable();
      }
      handleClose();
    } catch (error) {
      setSnackbar({
        message: "Error al crear la orden de compra",
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <CommonModalForm
      open={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Nueva Orden de Compra"
      methods={methods}
      loading={loading}
      submitButtonText="Crear Orden"
      maxWidth="sm"
    >
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
    </CommonModalForm>
  );
};

export default NuevaOrdenDeCompraModal;
