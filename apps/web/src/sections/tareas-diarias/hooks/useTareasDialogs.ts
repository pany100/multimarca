import { useState } from "react";
import { TareaDiaria } from "../types/TareaDiaria";

interface UseTareasDialogsProps {
  crearTareaDiaria: (descripcion: string) => Promise<void>;
  actualizarTareaDiaria: (id: number, data: { descripcion: string }) => Promise<void>;
  eliminarTareaDiaria: (id: number) => Promise<void>;
}

export const useTareasDialogs = ({
  crearTareaDiaria,
  actualizarTareaDiaria,
  eliminarTareaDiaria,
}: UseTareasDialogsProps) => {
  // Estados de los diálogos
  const [dialogoCrearAbierto, setDialogoCrearAbierto] = useState(false);
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<TareaDiaria | null>(null);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const [tareaEliminar, setTareaEliminar] = useState<TareaDiaria | null>(null);

  // Handlers para crear tarea
  const handleCrearTarea = async (descripcion: string) => {
    await crearTareaDiaria(descripcion);
  };

  const abrirDialogoCrear = () => {
    setDialogoCrearAbierto(true);
  };

  const cerrarDialogoCrear = () => {
    setDialogoCrearAbierto(false);
  };

  // Handlers para editar tarea
  const handleEditarTarea = (tarea: TareaDiaria) => {
    setTareaEditando(tarea);
    setDialogoEditarAbierto(true);
  };

  const handleGuardarEdicion = async (
    id: number,
    data: { descripcion: string }
  ) => {
    await actualizarTareaDiaria(id, data);
    setDialogoEditarAbierto(false);
    setTareaEditando(null);
  };

  const cerrarDialogoEditar = () => {
    setDialogoEditarAbierto(false);
    setTareaEditando(null);
  };

  // Handlers para eliminar tarea
  const handleEliminarTarea = (tarea: TareaDiaria) => {
    setTareaEliminar(tarea);
    setDialogoEliminarAbierto(true);
  };

  const handleConfirmarEliminar = async (id: number) => {
    await eliminarTareaDiaria(id);
    setDialogoEliminarAbierto(false);
    setTareaEliminar(null);
  };

  const cerrarDialogoEliminar = () => {
    setDialogoEliminarAbierto(false);
    setTareaEliminar(null);
  };

  return {
    // Estados
    dialogoCrearAbierto,
    dialogoEditarAbierto,
    tareaEditando,
    dialogoEliminarAbierto,
    tareaEliminar,

    // Handlers de crear
    handleCrearTarea,
    abrirDialogoCrear,
    cerrarDialogoCrear,

    // Handlers de editar
    handleEditarTarea,
    handleGuardarEdicion,
    cerrarDialogoEditar,

    // Handlers de eliminar
    handleEliminarTarea,
    handleConfirmarEliminar,
    cerrarDialogoEliminar,
  };
};
