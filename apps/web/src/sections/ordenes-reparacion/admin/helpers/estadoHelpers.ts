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
