import { EditMecanicoData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { EmpleadoService } from "../../services/empleados.service";

export class EditEmpleadoUseCase {
  constructor(private readonly service: EmpleadoService) {}

  async execute(dto: EditMecanicoData) {
    const empleado = await this.service.findById(dto.id);
    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }
    return this.service.update(dto);
  }
}
