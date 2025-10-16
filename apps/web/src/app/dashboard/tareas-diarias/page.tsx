"use client";

import { useAuth } from "@/hooks/useAuth";
import CrearTareaDialog from "@/sections/tareas-diarias/components/CrearTareaDialog";
import EditarTareaDialog from "@/sections/tareas-diarias/components/EditarTareaDialog";
import EliminarTareaDialog from "@/sections/tareas-diarias/components/EliminarTareaDialog";
import FechaSection from "@/sections/tareas-diarias/components/FechaSection";
import useTareasDiarias from "@/sections/tareas-diarias/hooks/useTareasDiarias";
import { useTareasDialogs } from "@/sections/tareas-diarias/hooks/useTareasDialogs";
import { TareaDiaria } from "@/sections/tareas-diarias/types/TareaDiaria";
import {
  agruparTareasPorFecha,
  ordenarFechas,
} from "@/sections/tareas-diarias/utils/tareas.utils";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const TareasDiariasPage = () => {
  const [fechaActual, setFechaActual] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const { userData } = useAuth();
  console.log(userData);
  const {
    tareas,
    loading,
    error,
    obtenerTareasDiarias,
    crearTareaDiaria,
    actualizarTareaDiaria,
    cambiarEstadoTarea,
    eliminarTareaDiaria,
  } = useTareasDiarias({ userData });

  const {
    dialogoCrearAbierto,
    dialogoEditarAbierto,
    tareaEditando,
    dialogoEliminarAbierto,
    tareaEliminar,
    handleCrearTarea,
    abrirDialogoCrear,
    cerrarDialogoCrear,
    handleEditarTarea,
    handleGuardarEdicion,
    cerrarDialogoEditar,
    handleEliminarTarea,
    handleConfirmarEliminar,
    cerrarDialogoEliminar,
  } = useTareasDialogs({
    crearTareaDiaria,
    actualizarTareaDiaria,
    eliminarTareaDiaria,
  });

  useEffect(() => {
    obtenerTareasDiarias(fechaActual, true);
  }, [fechaActual, obtenerTareasDiarias]);

  const tareasAgrupadas = agruparTareasPorFecha(tareas);
  const fechasOrdenadas = ordenarFechas(Object.keys(tareasAgrupadas));


  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Tareas Diarias</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={abrirDialogoCrear}
        >
          Nueva Tarea
        </Button>
      </Box>

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tareas agrupadas por fecha */}
      {!loading && fechasOrdenadas.length === 0 && (
        <Alert severity="info">No hay tareas pendientes</Alert>
      )}

      {fechasOrdenadas.map((fecha) => (
        <FechaSection
          key={fecha}
          fecha={fecha}
          tareas={tareasAgrupadas[fecha]}
          currentUserId={userData?.id}
          onCambiarEstado={cambiarEstadoTarea}
          onEditarTarea={handleEditarTarea}
          onEliminarTarea={handleEliminarTarea}
        />
      ))}

      {/* Diálogos */}
      <CrearTareaDialog
        open={dialogoCrearAbierto}
        onClose={cerrarDialogoCrear}
        onCrear={handleCrearTarea}
      />

      <EditarTareaDialog
        open={dialogoEditarAbierto}
        onClose={cerrarDialogoEditar}
        tarea={tareaEditando}
        onEditar={handleGuardarEdicion}
      />

      <EliminarTareaDialog
        open={dialogoEliminarAbierto}
        onClose={cerrarDialogoEliminar}
        tarea={tareaEliminar}
        onEliminar={handleConfirmarEliminar}
      />
    </Box>
  );
};

export default TareasDiariasPage;
