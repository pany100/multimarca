import { EmpleadoVO } from "@/core/domain/value-objects/empleado-vo";
import {
  CreateMecanicoData,
  EditMecanicoData,
} from "@/core/infrastructure/validation/schemas/mecanico.schema";

export class EmpleadoVOMapper {
  public static transformCreateDtoToVo(dto: CreateMecanicoData): EmpleadoVO {
    return new EmpleadoVO(
      null, // Para crear, siempre es null
      dto.name,
      dto.start_date ? new Date(dto.start_date) : null,
      dto.dni ? dto.dni.toString() : null,
      dto.claveFiscal || null,
      dto.address || null,
      dto.city || null,
      dto.state || null,
      dto.postal_code || null,
      dto.email || null,
      dto.phone || null,
      dto.tipo || undefined,
      dto.birthday ? new Date(dto.birthday) : null,
      dto.dniImagePath || null,
      dto.contactoEmergencia || null
    );
  }

  public static transformEditDtoToVo(dto: EditMecanicoData): EmpleadoVO {
    return new EmpleadoVO(
      dto.id, // Para editar, usa el ID del DTO
      dto.name,
      dto.start_date ? new Date(dto.start_date) : null,
      dto.dni ? dto.dni.toString() : null,
      dto.claveFiscal || null,
      dto.address || null,
      dto.city || null,
      dto.state || null,
      dto.postal_code || null,
      dto.email || null,
      dto.phone || null,
      dto.tipo || undefined,
      dto.birthday ? new Date(dto.birthday) : null,
      dto.dniImagePath || null,
      dto.contactoEmergencia || null
    );
  }
}
