"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import DescriptionIcon from "@mui/icons-material/Description";
import { Box, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useOrden } from "../contexts/OrdenContext";
import EditScannerForm from "../forms/EditScannerForm";
import { useUpdateScanner } from "../hooks/useUpdateScanner";
import { CommonOrderCard } from "./CommonOrderCard";

const schema = yup.object({
  scannerFile: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

function ScannerSection() {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateScanner, loading } = useUpdateScanner();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      scannerFile: orden.scannerFile?.finalPath || null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      scannerFile: orden.scannerFile?.finalPath || null,
    });
  };

  const handleErrorUploading = (error: string) => {
    setSnackbar({
      open: true,
      message: error,
      severity: "error",
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateScanner(orden.id, {
        scannerFile: data.scannerFile,
      });

      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Scanner actualizado correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar el scanner",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Scanner"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditScannerForm onErrorUploading={handleErrorUploading} />}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <DescriptionIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Box flex={1}>
          {orden.scannerFile ? (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>Archivo scanner cargado</strong>
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: 300,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <iframe
                  src={`${orden.scannerFile}#toolbar=0&navpanes=0&scrollbar=0`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title="Vista previa del scanner"
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => window.open(orden.scannerFile!, "_blank")}
              >
                Abrir en nueva pestaña
              </Button>
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="text.disabled"
              fontStyle="italic"
            >
              No hay salida de scanner cargada
            </Typography>
          )}
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

export default ScannerSection;
