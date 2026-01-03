"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useControles from "@/hooks/orden-reparacion/useControles";
import useControlesFetch from "@/hooks/orden-reparacion/useControlesFetch";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import CheckboxControlesView from "./components/controles/CheckboxControlesView";
import GroupControlesView from "./components/controles/GroupControlesView";
import TextControlesView from "./components/controles/TextControlesView";
import { useOrden } from "./contexts/OrdenContext";
import EditControlesForm from "./forms/EditControlesForm";
import { useUpdateControles } from "./hooks/useUpdateControles";

const ControlesSection = () => {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateControles, loading: updating } = useUpdateControles();
  const [isEditing, setIsEditing] = useState(false);
  const [editableControles, setEditableControles] = useState<any[]>([]);

  // Obtener todos los controles del sistema
  const {
    checkControls: allCheckControls,
    textControls: allTextControls,
    groupControls: allGroupControls,
    loading: loadingControles,
  } = useControlesFetch();

  // Mapear controles con valores de la orden
  const controlesConValores = [
    ...allCheckControls,
    ...allTextControls,
    ...allGroupControls.flatMap((g: any) => g.controls),
  ].map((control) => {
    const controlEnOrden = orden.controlesEnReparacion?.find(
      (c: any) => c.controlMecanicoId === control.id
    );
    return {
      ...control,
      valor:
        controlEnOrden?.valor || (control.type === "checkbox" ? "false" : ""),
    };
  });

  // Usar useControles para organizar los controles con valores
  const { checkControls, textControls, groupControls } = useControles({
    controlesList: controlesConValores,
  });

  const handleEdit = () => {
    setEditableControles(controlesConValores);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableControles([]);
  };

  const handleSave = async () => {
    try {
      // Escuchar el evento de cambios de controles
      const handleControlesChanged = (event: any) => {
        setEditableControles(event.detail);
      };

      window.addEventListener("controlesChanged", handleControlesChanged);

      // Esperar un momento para que el evento se dispare
      await new Promise((resolve) => setTimeout(resolve, 100));

      window.removeEventListener("controlesChanged", handleControlesChanged);

      // Preparar datos para el PATCH (UPSERT)
      const controlesParaActualizar = editableControles.map((control) => ({
        controlMecanicoId: control.id,
        valor: control.valor,
      }));

      const ordenActualizada = await updateControles(
        orden.id,
        controlesParaActualizar
      );

      setOrden(ordenActualizada);
      setIsEditing(false);
      setEditableControles([]);

      setSnackbar({
        open: true,
        message: "Controles actualizados correctamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar los controles",
        severity: "error",
      });
    }
  };

  if (loadingControles) {
    return (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Controles</Typography>
          {!isEditing && (
            <IconButton
              size="small"
              onClick={handleEdit}
              aria-label="Editar"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Contenido */}
        {isEditing ? (
          <>
            <EditControlesForm />
            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={updating}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={updating}
                startIcon={updating && <CircularProgress size={20} />}
              >
                {updating ? "Guardando..." : "Confirmar"}
              </Button>
            </Box>
          </>
        ) : (
          <Grid container spacing={3}>
            {checkControls.length > 0 && (
              <Grid container item xs={12} spacing={2}>
                <CheckboxControlesView checkControls={checkControls} />
              </Grid>
            )}
            {groupControls.length > 0 && (
              <Grid container item xs={12} spacing={2}>
                <GroupControlesView groupControls={groupControls} />
              </Grid>
            )}
            {textControls.length > 0 && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    gutterBottom
                  >
                    Información Adicional
                  </Typography>
                  <TextControlesView textControls={textControls} />
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default ControlesSection;
