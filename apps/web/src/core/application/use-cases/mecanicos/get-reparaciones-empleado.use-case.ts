import { GetMecanicoReparacionesData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { EmpleadoService } from "../../services/empleados.service";

export class GetReparacionesEmpleadoUseCase {
  constructor(private readonly empleadoService: EmpleadoService) {}

  async execute(dto: GetMecanicoReparacionesData) {
    return this.empleadoService.getReparacionesEmpleado(dto);
  }
}
