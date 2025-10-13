import { ListMecanicosQueryData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { EmpleadoService } from "../../services/empleados.service";

export class ListEmpleadosUseCase {
  constructor(private readonly service: EmpleadoService) {}

  async execute(dto: ListMecanicosQueryData) {
    return this.service.findAll(dto);
  }
}
