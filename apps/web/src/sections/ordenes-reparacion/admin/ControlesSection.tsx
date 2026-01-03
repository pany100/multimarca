"use client";

import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useControlesContext } from "./contexts/ControlesContext";
import { useOrden } from "./contexts/OrdenContext";
import EditControlesForm from "./forms/EditControlesForm";
import { useUpdateControles } from "./hooks/useUpdateControles";

const ControlesSection = () => {
  const [isEditing, setIsEditing] = useState(false);

  const { loading: updating, updateControles } = useUpdateControles();
  const { itemsEdited, reset } = useControlesContext();
  const { orden } = useOrden();
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
              onClick={() => setIsEditing(true)}
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
        <EditControlesForm isEditing={isEditing} />

        {isEditing && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              disabled={updating}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={() => updateControles(orden.id, itemsEdited)}
              disabled={updating}
              startIcon={updating && <CircularProgress size={20} />}
            >
              {updating ? "Guardando..." : "Confirmar"}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ControlesSection;
