import { CreateOrdenDto } from "@/core/application/dto/orden-reparacion.dto";

export function hasAllRequiredFields(input: CreateOrdenDto) {
  return (
    (input.mecanicos?.length ?? 0) > 0 &&
    input.fechaEntradaReparacion &&
    input.fechaSalidaReparacion &&
    ((input.repuestosUsados?.length ?? 0) > 0 ||
      (input.reparacionesDeTercero?.length ?? 0) > 0 ||
      (input.trabajosRealizados?.length ?? 0) > 0)
  );
}
