import { TransaccionRepository } from "@/core/domain/repositories/transaccion.repository";
import { UpdateRevisadoYEnviadoDto } from "../dto/resumen.dto";

export class TransaccionService {
  constructor(private transaccionRepository: TransaccionRepository) {}

  async update(dto: UpdateRevisadoYEnviadoDto) {
    const transaccion = await this.transaccionRepository.update(dto);
    return transaccion;
  }
}
