import { GetClienteDto } from "../../dto/cliente.dto";
import { ClienteService } from "../../services/cliente.service";

export class GetClienteUseCase {
  constructor(private readonly service: ClienteService) {}

  async execute(dto: GetClienteDto) {
    return this.service.findById(dto.id);
  }
}
