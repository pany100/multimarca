"use client";

import ImageInput from "@/components/ImageInput";
import CommonModalForm from "@/components/commons/CommonModalForm";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { useOrden } from "./contexts/OrdenContext";
import { useAddRecibo } from "./hooks/useAddRecibo";

const schema = yup.object({
  reciboPath: yup
    .string()
    .nullable()
    .required("La imagen del recibo es requerida"),
});

type FormData = yup.InferType<typeof schema>;

function RecibosSection() {
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { addRecibo, loading } = useAddRecibo();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      reciboPath: undefined,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      reciboPath: undefined,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    methods.reset();
  };

  const handleSubmit = async (data: FormData) => {
    if (!data.reciboPath) return;

    try {
      const result = await addRecibo(orden.id, data.reciboPath);

      setOrden({
        ...orden,
        recibosFiles: result.recibos,
      });

      setSnackbar({
        open: true,
        message: "Recibo agregado correctamente",
        severity: "success",
      });

      handleCloseModal();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al agregar el recibo",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1 }}>
          {/* Header con título y botón editar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Typography variant="h6">Recibos</Typography>
            <IconButton
              size="small"
              onClick={() => setEditing(true)}
              aria-label="Editar"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </div>

          {(!orden.recibosFiles || orden.recibosFiles.length === 0) && (
            <Box p={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                No hay recibos cargados
              </Typography>
            </Box>
          )}

          {editing && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button variant="outlined" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenModal}
              >
                Agregar Recibo
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <CommonModalForm
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title="Agregar Recibo"
        methods={methods}
        loading={loading}
        submitButtonText="Agregar"
      >
        <Box sx={{ mt: 2 }}>
          <Controller
            name="reciboPath"
            control={methods.control}
            render={({ field }) => (
              <ImageInput
                label="Imagen del recibo"
                image={field.value}
                setImage={(image: string | null) => field.onChange(image)}
              />
            )}
          />
        </Box>
      </CommonModalForm>
    </>
  );
}

export default RecibosSection;
