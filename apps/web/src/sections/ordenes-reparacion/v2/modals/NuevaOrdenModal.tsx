"use client";

import CommonModalForm from "@/components/commons/CommonModalForm";
import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useNuevaOrdenHandlers } from "../hooks/useNuevaOrdenHandlers";

const schema = yup.object({
  autoId: yup.number().required("El vehículo es requerido"),
  kilometros: yup.number().nullable().optional(),
  observacionesCliente: yup
    .string()
    .required("Las observaciones son requeridas"),
});

type FormData = yup.InferType<typeof schema>;

const NuevaOrdenModal = () => {
  const { isOpen, hideModal } = useGlobalModal();
  const { searchAutos, initialAuto } = useAutosAutocomplete();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      autoId: undefined,
      kilometros: null,
      observacionesCliente: "",
    },
  });

  const handleClose = () => {
    methods.reset();
    hideModal();
  };

  const { handleSubmit, loading } = useNuevaOrdenHandlers({
    onClose: handleClose,
  });

  return (
    <CommonModalForm
      open={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Nueva Orden de Reparación"
      methods={methods}
      loading={loading}
      submitButtonText="Crear Orden"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomAutocompleteInput
            name="autoId"
            label="Vehículo"
            searchOptions={searchAutos}
            initialOptions={initialAuto}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText name="kilometros" label="Kilómetros" type="number" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="observacionesCliente"
            label="Observaciones del Cliente"
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </CommonModalForm>
  );
};

export default NuevaOrdenModal;
