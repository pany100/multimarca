import { ChipProps } from "@mui/material";

function roundToNearestThousandOrFiveHundred(value: number): number {
  return Math.ceil(value / 500) * 500;
}

function calcularPrecioFinal(
  precio: number,
  porcentajeRecargo?: number | string
): number {
  const recargoNum = Number(porcentajeRecargo) || 0;
  const precioNum = Number(precio);
  if (recargoNum === 0) {
    return parseFloat(precioNum.toFixed(2));
  }
  const recargo = (precioNum * recargoNum) / 100;
  const total = roundToNearestThousandOrFiveHundred(precioNum + recargo);

  return parseFloat(total.toFixed(2));
}

function calcularTotalRepuestos(ordenReparacion: {
  repuestosUsados: {
    precioVenta: number;
    unidadesConsumidas: number;
  }[];
}): string {
  if (!ordenReparacion.repuestosUsados) {
    return "0";
  }
  return ordenReparacion.repuestosUsados
    .reduce(
      (total, repuesto) =>
        total +
        calcularPrecioFinal(parseFloat(repuesto.precioVenta.toString())),
      0
    )
    .toFixed(2);
}

function calcularTotalReparacionesTerceros(ordenReparacion: {
  reparacionesDeTercero: { precioVenta: number }[];
  porcentajeRecargo?: number;
}): string {
  if (!ordenReparacion.reparacionesDeTercero) {
    return "0";
  }
  return ordenReparacion.reparacionesDeTercero
    .reduce(
      (total, reparacion) =>
        total +
        calcularPrecioFinal(
          parseFloat(reparacion.precioVenta.toString()),
          ordenReparacion.porcentajeRecargo
        ),
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

function calcularTotalManoDeObra(
  trabajosRealizados: {
    precioUnitario: number;
  }[]
): string {
  if (!trabajosRealizados) {
    return "0";
  }
  return trabajosRealizados
    .reduce(
      (total, trabajo) => total + parseFloat(trabajo.precioUnitario.toString()),
      0
    )
    .toFixed(2);
}

function calcularTotalOrdenReparacion(ordenReparacion: {
  repuestosUsados: { precioVenta: number; unidadesConsumidas: number }[];
  reparacionesDeTercero: { precioVenta: number }[];
  trabajosRealizados: { precioUnitario: number }[];
  descuento: number;
  incremento?: number;
  incrementoInterno?: number;
  porcentajeRecargo?: number;
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
  const incremento = parseFloat(ordenReparacion.incremento?.toString() || "0");
  const incrementoInterno = parseFloat(
    ordenReparacion.incrementoInterno?.toString() || "0"
  );
  return (
    totalRepuestos +
    totalReparacionesTerceros +
    manoDeObra +
    incrementoInterno -
    descuento +
    incremento
  );
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

function calcularTotalPagos(ordenReparacion: {
  ingresos?: {
    monto: number;
    moneda: string;
    dolar?: {
      blue: number;
    };
  }[];
}): number {
  if (!ordenReparacion.ingresos || ordenReparacion.ingresos.length === 0) {
    return 0;
  }

  return ordenReparacion.ingresos.reduce((total, ingreso) => {
    if (ingreso.moneda === "Dolar") {
      return (
        total +
        parseFloat(ingreso.monto.toString()) * Number(ingreso.dolar?.blue || 0)
      );
    }
    return total + parseFloat(ingreso.monto.toString());
  }, 0);
}

export {
  calcularManoDeObra,
  calcularPrecioFinal,
  calcularTotalManoDeObra,
  calcularTotalOrdenReparacion,
  calcularTotalPagos,
  calcularTotalReparacionesTerceros,
  calcularTotalRepuestos,
  getStatusColor,
};
