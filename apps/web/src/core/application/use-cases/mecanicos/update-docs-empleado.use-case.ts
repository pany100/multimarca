import { UpdateMecanicoDocsData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { EmpleadoService } from "../../services/empleados.service";

export class UpdateEmpleadoDocsUseCase {
  constructor(private readonly service: EmpleadoService) {}

  async execute(dto: UpdateMecanicoDocsData) {
    const empleado = await this.service.findById(dto.id);
    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }
    return this.service.updateDocs(dto);
  }
}
