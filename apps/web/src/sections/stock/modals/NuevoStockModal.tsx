"use client";

import CommonModalForm from "@/components/commons/CommonModalForm";
import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  label: yup.string().required("El rótulo es requerido"),
  proveedorId: yup.number().required("El proveedor es requerido"),
});

type FormData = yup.InferType<typeof schema>;

interface NuevoStockModalProps {
  refreshTable?: () => void;
}

export default function NuevoStockModal({ refreshTable }: NuevoStockModalProps) {
  const { isOpen, hideModal } = useGlobalModal();
  const { setSnackbar } = useSnackbarContext();
  const { authFetch } = useFetch();
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      label: "",
      proveedorId: undefined as any,
    },
  });

  const handleClose = () => {
    methods.reset();
    hideModal();
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await authFetch("/api/stock", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await response.json().catch(() => ({}));
        setSnackbar({
          open: true,
          message: errorMessage?.error || "Error al crear stock",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "Stock creado con éxito",
        severity: "success",
      });
      refreshTable?.();
      handleClose();
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Error al realizar la solicitud de creación",
        severity: "error",
      });
    }
  };

  return (
    <CommonModalForm
      open={isOpen}
      onClose={handleClose}
      onSubmit={methods.handleSubmit(onSubmit)}
      title="Nuevo Stock"
      methods={methods as any}
      loading={false}
      submitButtonText="Crear"
      maxWidth="sm"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="name" label="Nombre" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText name="label" label="Rótulo" />
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
}

