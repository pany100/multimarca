import { Empleado } from "@prisma/client";
import { EmpleadoService } from "../../services/empleados.service";

export class DeleteEmpleadoUseCase {
  constructor(private readonly service: EmpleadoService) {}

  async execute(id: number): Promise<Empleado | null> {
    return this.service.delete(id);
  }
}
