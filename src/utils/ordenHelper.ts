import { ChipProps } from "@mui/material";

function calcularTotalRepuestos(ordenReparacion: {
  repuestosUsados: {
    precioVenta: number;
    unidadesConsumidas: number;
  }[];
}): number {
  return ordenReparacion.repuestosUsados.reduce(
    (total, repuesto) => total + parseFloat(repuesto.precioVenta.toString()),
    0
  );
}

function calcularTotalReparacionesTerceros(ordenReparacion: {
  reparacionesDeTercero: { precioVenta: number }[];
}): number {
  return ordenReparacion.reparacionesDeTercero.reduce(
    (total, reparacion) =>
      total + parseFloat(reparacion.precioVenta.toString()),
    0
  );
}

function calcularTotalOrdenReparacion(ordenReparacion: {
  repuestosUsados: { precioVenta: number; unidadesConsumidas: number }[];
  reparacionesDeTercero: { precioVenta: number }[];
  manoDeObra: number;
}): number {
  const totalRepuestos = calcularTotalRepuestos(ordenReparacion);

  const totalReparacionesTerceros =
    calcularTotalReparacionesTerceros(ordenReparacion);
  // 3. Mano de obra
  const manoDeObra = parseFloat(ordenReparacion.manoDeObra.toString());

  return totalRepuestos + totalReparacionesTerceros + manoDeObra;
}

function getStatusColor(estado: string): ChipProps["color"] {
  switch (estado.toLowerCase()) {
    case "en progreso":
      return "primary";
    case "terminado":
      return "success";
    case "aceptado":
      return "warning";
    case "presupuestado":
      return "error";
    default:
      return "default";
  }
}

export {
  calcularTotalOrdenReparacion,
  calcularTotalReparacionesTerceros,
  calcularTotalRepuestos,
  getStatusColor,
};
