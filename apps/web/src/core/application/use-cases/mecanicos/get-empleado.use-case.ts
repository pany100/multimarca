import { EmpleadoService } from "../../services/empleados.service";

export class GetEmpleadoUseCase {
  constructor(private readonly service: EmpleadoService) {}

  async execute(id: number) {
    return this.service.findById(id);
  }
}
