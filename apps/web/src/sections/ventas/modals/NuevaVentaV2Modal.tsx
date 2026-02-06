import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import FilesInput from "@/components/formV2/files/FilesInput";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { useNuevaVentaV2Handlers } from "../hooks/useNuevaVentaV2Handlers";

const schema = yup.object().shape({
  clienteId: yup.number().nullable().optional(),
  informacionCliente: yup.string().nullable().optional(),
  cedulaFilePath: yup.string().nullable().optional(),
  fecha: yup.date().required("La fecha es obligatoria"),
});

interface NuevaVentaV2ModalProps {
  refreshTable: () => void;
}

const NuevaVentaV2Modal = ({ refreshTable }: NuevaVentaV2ModalProps) => {
  const { isOpen: isModalOpen, hideModal } = useGlobalModal();
  const { searchClientes, initialCliente } = useClientesAutocomplete();
  const [tabValue, setTabValue] = useState(0);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clienteId: null,
      informacionCliente: "",
      cedulaFilePath: null,
      fecha: new Date(),
    },
  });

  const {
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitted },
    watch,
    setValue,
    reset,
  } = methods;

  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { handleSubmit, loading } = useNuevaVentaV2Handlers({
    refreshTable,
    closeModal: () => {
      hideModal();
      reset();
      setTabValue(0);
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      // Clear informacionCliente when switching to existing client (cedulaFilePath se mantiene)
      setValue("informacionCliente", "");
    } else {
      // Clear clienteId when switching to new client
      setValue("clienteId", null);
    }
  };

  const onSubmit = (data: any) => {
    // Validate that at least one of clienteId or informacionCliente is provided
    if (!data.clienteId && !data.informacionCliente) {
      methods.setError("clienteId", {
        type: "manual",
        message:
          "Debe seleccionar un cliente o ingresar información del cliente",
      });
      methods.setError("informacionCliente", {
        type: "manual",
        message:
          "Debe seleccionar un cliente o ingresar información del cliente",
      });
      return;
    }

    handleSubmit(data);
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={hideModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Nueva Venta V2
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={handleFormSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Client Section */}
              <Grid item xs={12}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="client selection tabs"
                  >
                    <Tab label="Cliente existente en sistema" />
                    <Tab label="Cliente nuevo" />
                  </Tabs>
                </Box>
              </Grid>

              {tabValue === 0 ? (
                <Grid
                  item
                  xs={12}
                  ref={(el) => registerFieldRef("clienteId", el)}
                >
                  <CustomAutocompleteInput
                    name="clienteId"
                    label="Cliente"
                    searchOptions={searchClientes}
                    initialOptions={initialCliente}
                  />
                </Grid>
              ) : (
                <>
                  <Grid
                    item
                    xs={12}
                    ref={(el) => registerFieldRef("informacionCliente", el)}
                  >
                    <CustomInputText
                      name="informacionCliente"
                      label="Datos del cliente"
                      placeholder="Nombre, teléfono, dirección, etc."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FilesInput
                      label="Cédula (imagen)"
                      filePath={watch("cedulaFilePath") || null}
                      setFilePath={(url) => setValue("cedulaFilePath", url)}
                      acceptedTypes="images"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Date Field */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={
                    watch("fecha")
                      ? new Date(watch("fecha")).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => setValue("fecha", new Date(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.fecha}
                  helperText={errors.fecha?.message}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={hideModal} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: "#8A2BE2",
                "&:hover": {
                  backgroundColor: "#7B1FA2",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Crear Venta"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default NuevaVentaV2Modal;
