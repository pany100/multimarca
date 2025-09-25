import { UpdateRevisadoYEnviadoDto } from "../../dto/resumen.dto";
import { TransaccionService } from "../../services/transaccion.service";

export class UpdateRevisadoUseCase {
  constructor(private transaccionService: TransaccionService) {}

  async execute(dto: UpdateRevisadoYEnviadoDto) {
    const transaccion = await this.transaccionService.update(dto);
    return transaccion;
  }
}
