export const getEstadoColor = (estado: string) => {
  const colors: Record<
    string,
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
  > = {
    Borrador: "default",
    Presupuestado: "info",
    EnProgreso: "warning",
    Aceptado: "primary",
    Terminado: "success",
    SeRetira: "secondary",
    Incobrable: "error",
  };
  return colors[estado] || "default";
};

export const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    Borrador: "Borrador",
    Presupuestado: "Presupuestado",
    EnProgreso: "En Progreso",
    Aceptado: "Aceptado",
    Terminado: "Terminado",
    SeRetira: "Se Retira",
    Incobrable: "Incobrable",
  };
  return labels[estado] || estado;
};

// Presupuesto helpers
export const getEstadoPresupuestoColor = (estado: string) => {
  const colors: Record<
    string,
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
  > = {
    EnPreparacion: "warning",
    Terminado: "info",
    Enviado: "primary",
    ADefinir: "default",
    Aceptado: "success",
    Rechazado: "error",
    Descartado: "default",
  };
  return colors[estado] || "default";
};

export const getEstadoPresupuestoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    EnPreparacion: "En Preparación",
    Terminado: "Terminado",
    Enviado: "Enviado",
    ADefinir: "A Definir",
    Aceptado: "Aceptado",
    Rechazado: "Rechazado",
    Descartado: "Descartado",
  };
  return labels[estado] || "Estado Desconocido";
};
