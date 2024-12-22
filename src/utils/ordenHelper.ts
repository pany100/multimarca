import { ChipProps } from "@mui/material";

function calcularTotalRepuestos(ordenReparacion: {
  repuestosUsados: {
    precioVenta: number;
    unidadesConsumidas: number;
  }[];
}): string {
  return ordenReparacion.repuestosUsados
    .reduce(
      (total, repuesto) => total + parseFloat(repuesto.precioVenta.toString()),
      0
    )
    .toFixed(2);
}

function calcularTotalReparacionesTerceros(ordenReparacion: {
  reparacionesDeTercero: { precioVenta: number }[];
}): string {
  return ordenReparacion.reparacionesDeTercero
    .reduce(
      (total, reparacion) =>
        total + parseFloat(reparacion.precioVenta.toString()),
      0
    )
    .toFixed(2);
}

function calcularManoDeObra(
  trabajosRealizados: {
    precioUnitario: number;
  }[]
): number {
  return trabajosRealizados.reduce(
    (total, trabajo) => total + parseFloat(trabajo.precioUnitario.toString()),
    0
  );
}

function calcularTotalOrdenReparacion(ordenReparacion: {
  repuestosUsados: { precioVenta: number; unidadesConsumidas: number }[];
  reparacionesDeTercero: { precioVenta: number }[];
  trabajosRealizados: { precioUnitario: number }[];
  descuento: number;
}): number {
  const totalRepuestos = Number(calcularTotalRepuestos(ordenReparacion));

  const totalReparacionesTerceros = Number(
    calcularTotalReparacionesTerceros(ordenReparacion)
  );
  // 3. Mano de obra
  const manoDeObra = Number(
    calcularManoDeObra(ordenReparacion.trabajosRealizados)
  );

  const descuento = parseFloat(ordenReparacion.descuento.toString());

  return totalRepuestos + totalReparacionesTerceros + manoDeObra - descuento;
}

function getStatusColor(estado: string): ChipProps["color"] {
  switch (estado.toLowerCase()) {
    case "enprogreso":
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
  calcularManoDeObra,
  calcularTotalOrdenReparacion,
  calcularTotalReparacionesTerceros,
  calcularTotalRepuestos,
  getStatusColor,
};
