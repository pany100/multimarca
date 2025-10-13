import { CreateMecanicoData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { EmpleadoService } from "../../services/empleados.service";

export class CreateEmpleadosUseCase {
  constructor(private readonly service: EmpleadoService) {}

  async execute(dto: CreateMecanicoData) {
    return this.service.create(dto);
  }
}
