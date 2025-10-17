"use client";

import { useAuth } from "@/hooks/useAuth";
import CrearTareaDialog from "@/sections/tareas-diarias/components/CrearTareaDialog";
import EditarTareaDialog from "@/sections/tareas-diarias/components/EditarTareaDialog";
import EliminarTareaDialog from "@/sections/tareas-diarias/components/EliminarTareaDialog";
import FechaSection from "@/sections/tareas-diarias/components/FechaSection";
import TareasFilters from "@/sections/tareas-diarias/components/TareasFilters";
import { useTareasDialogs } from "@/sections/tareas-diarias/hooks/useTareasDialogs";
import useTareasDiarias from "@/sections/tareas-diarias/hooks/useTareasDiarias";
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
import { useEffect, useState } from "react";

const TareasDiariasPage = () => {
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const { userData } = useAuth();
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

  // Cargar tareas inicialmente sin filtros
  useEffect(() => {
    obtenerTareasDiarias();
  }, [obtenerTareasDiarias]);

  // Handler para búsqueda desde el componente de filtros
  const handleSearch = (
    searchQuery: string,
    fromDate: Date | null,
    toDate: Date | null,
    hasActiveFilters: boolean
  ) => {
    const fromStr = fromDate ? fromDate.toISOString().split("T")[0] : null;
    const toStr = toDate ? toDate.toISOString().split("T")[0] : null;
    const searchText = searchQuery.trim() || undefined;

    setIsSearchActive(hasActiveFilters);
    obtenerTareasDiarias(fromStr, toStr, searchText);
  };

  // Handler para limpiar solo texto (botón X en el input)
  const handleClearSearchText = () => {
    // Solo ejecuta una nueva búsqueda si hay otros filtros activos
    // Si no hay otros filtros, no hace nada (mantiene el botón Resetear visible)
  };

  // Handler para resetear todos los filtros (botón Resetear)
  const handleResetFilters = () => {
    setIsSearchActive(false);
    obtenerTareasDiarias();
  };

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

      {/* Filtros */}
      <TareasFilters 
        onSearch={handleSearch} 
        onClear={handleClearSearchText}
        onReset={handleResetFilters}
      />

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
          isSearchMode={isSearchActive}
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
