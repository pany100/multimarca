"use client";

import { Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { CommonOrderCard } from "./components/CommonOrderCard";
import { useOrden } from "./contexts/OrdenContext";

const EstadoYFechasSection = () => {
  const { orden } = useOrden();

  // Form methods para el modal
  const methods = useForm({
    defaultValues: {
      estado: orden.estado,
      // Agregar más campos según necesites
    },
  });

  // Handler para el submit del formulario
  const handleSubmit = async (data: any) => {
    console.log("Datos del formulario:", data);
    // Aquí irá la lógica para actualizar el estado y fechas
    // Por ejemplo: await updateOrdenEstado(orden.id, data);
  };

  return (
    <CommonOrderCard
      title="Estado y Fechas"
      formMethods={methods}
      onSubmit={handleSubmit}
      formContent={
        <>
          {/* Aquí defines el contenido del formulario del modal */}
          <Typography variant="body2" color="text.secondary">
            Formulario para cambiar estado y actualizar fechas (por implementar)
          </Typography>
        </>
      }
    >
      {/* Aquí defines el contenido que se muestra en la card */}
      <Typography variant="body2" color="text.secondary">
        <strong>Estado actual:</strong> {orden.estado}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Placeholder: Mostrar fechas de creación, actualización, etc.
      </Typography>
    </CommonOrderCard>
  );
};

export default EstadoYFechasSection;
