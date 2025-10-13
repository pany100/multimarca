import { EmpleadoVO } from "@/core/domain/value-objects/empleado-vo";
import { CreateMecanicoData } from "@/core/infrastructure/validation/schemas/mecanico.schema";

export class EmpleadoVOMapper {
  public static transformDtoToVo(dto: CreateMecanicoData) {
    return new EmpleadoVO(
      null,
      dto.name,
      dto.start_date ? new Date(dto.start_date) : null,
      dto.dni ? dto.dni.toString() : null,
      dto.address || null,
      dto.city || null,
      dto.state || null,
      dto.postal_code || null,
      dto.email || null,
      dto.phone || null,
      dto.tipo || undefined,
      dto.birthday ? new Date(dto.birthday) : null,
      dto.dniImagePath || null
    );
  }
}
