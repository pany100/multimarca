"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { useOrden } from "./contexts/OrdenContext";
import { useAddRecibo } from "./hooks/useAddRecibo";

interface RecibosContentProps {
  editing: boolean;
}

function RecibosContent({ editing }: RecibosContentProps) {
  const { orden, setOrden } = useOrden();
  const { deleteRecibo, loading } = useAddRecibo();
  const { setSnackbar } = useSnackbarContext();
  const [deletingReciboPath, setDeletingReciboPath] = useState<string | null>(
    null,
  );

  const recibos = orden.recibosFiles || [];

  const handleDeleteRecibo = async (reciboPath: string) => {
    setDeletingReciboPath(reciboPath);
    try {
      const result = await deleteRecibo(orden.id, reciboPath);

      setOrden({
        ...orden,
        recibosFiles: result.recibos,
      });

      setSnackbar({
        open: true,
        message: "Recibo eliminado correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar el recibo",
        severity: "error",
      });
    } finally {
      setDeletingReciboPath(null);
    }
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {recibos.map(
        (recibo: { id: number; finalPath: string; tempPath: string }) => {
          const imagePath = recibo.finalPath || recibo.tempPath;
          const isDeleting = deletingReciboPath === imagePath;

          return (
            <Grid item xs={12} sm={6} md={4} key={recibo.id}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  height: "100%",
                }}
              >
                {/* Header con ícono */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ReceiptIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Typography variant="caption" color="text.secondary">
                    Recibo #{recibo.id}
                  </Typography>
                </Box>

                {/* Preview: misma estructura que ScannerSection para PDF, Image para imágenes */}
                {imagePath?.toLowerCase().endsWith(".pdf") ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>Recibo en PDF</strong>
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
                        src={`${imagePath}#toolbar=0&navpanes=0&scrollbar=0`}
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        title={`Recibo #${recibo.id} (PDF)`}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => window.open(imagePath, "_blank")}
                    >
                      Abrir en nueva pestaña
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      position: "relative",
                      borderRadius: 1,
                      overflow: "hidden",
                      backgroundColor: "grey.100",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {imagePath && (
                      <Image
                        src={imagePath}
                        alt={`Recibo #${recibo.id}`}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    )}
                  </Box>
                )}

                {/* Botón de eliminar solo cuando está en modo edición */}
                {editing && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={
                      isDeleting ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DeleteIcon />
                      )
                    }
                    onClick={() => handleDeleteRecibo(imagePath)}
                    disabled={isDeleting || loading}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                )}
              </Paper>
            </Grid>
          );
        },
      )}
    </Grid>
  );
}

export default RecibosContent;
