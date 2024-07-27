export function calcularTotalOrdenReparacion(ordenReparacion: {
  repuestosUsados: { precioVenta: number; unidadesConsumidas: number }[];
  reparacionesDeTercero: { precioVenta: number }[];
  manoDeObra: number;
}): number {
  // 1. Suma del precio de venta de cada repuesto usado
  const totalRepuestos = ordenReparacion.repuestosUsados.reduce(
    (total, repuesto) =>
      total + repuesto.precioVenta * repuesto.unidadesConsumidas,
    0
  );

  // 2. Suma del precio de venta de todas las reparaciones de terceros
  const totalReparacionesTerceros =
    ordenReparacion.reparacionesDeTercero.reduce(
      (total, reparacion) => total + reparacion.precioVenta,
      0
    );

  // 3. Mano de obra
  const manoDeObra = ordenReparacion.manoDeObra;

  // Suma total
  return totalRepuestos + totalReparacionesTerceros + manoDeObra;
}
