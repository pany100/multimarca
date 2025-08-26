import { EstadoOrdenReparacion } from "@prisma/client";

export function validateTerminada(dto: any) {
  if (dto.estado !== EstadoOrdenReparacion.Terminado) return;
  const ok =
    Array.isArray(dto.mecanicos) &&
    dto.mecanicos.length > 0 &&
    dto.fechaEntradaReparacion &&
    dto.fechaSalidaReparacion &&
    ((dto.repuestosUsados?.length ?? 0) > 0 ||
      (dto.reparacionesDeTercero?.length ?? 0) > 0 ||
      (dto.trabajosRealizados?.length ?? 0) > 0);
  if (!ok) {
    throw new Error(
      "Para finalizar, se requieren mecánicos, fechas y al menos un trabajo/repuesto/tercero."
    );
  }
}

export function mapRepuestosForInventory(repuestos: any[] = []) {
  return repuestos.map((r) => ({
    stockId: r.stock.id,
    units: r.unidadesConsumidas,
    name: r.stock?.name,
  }));
}
