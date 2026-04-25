const labels: Record<string, string> = {
  Mecanico: "Mecanico",
  Administrativo: "Administrativo",
  EquipoDirectivo: "Equipo Directivo",
};

export function tipoEmpleadoLabel(tipo: string | null | undefined): string {
  if (!tipo) return "";
  return labels[tipo] ?? tipo;
}
