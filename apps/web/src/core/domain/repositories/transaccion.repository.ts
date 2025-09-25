import { UpdateRevisadoYEnviadoDto } from "@/core/application/dto/resumen.dto";

export interface TransaccionRepository {
  update(dto: UpdateRevisadoYEnviadoDto): Promise<any>;
}
