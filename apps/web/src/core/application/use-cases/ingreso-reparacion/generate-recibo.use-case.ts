import { PrismaConfiguracionGeneralRepository } from "@/core/infrastructure/database/repositories/prisma-configuracion-general.repository";
import { PrismaIngresoReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-ingreso-reparacion.repository";
import { ReciboService } from "../../services/recibo.service";

export class GenerateReciboUseCase {
  constructor(private readonly reciboService: ReciboService) {}

  async execute(id: number) {
    const ingresoReparacionRepository = new PrismaIngresoReparacionRepository();
    const configRepo = new PrismaConfiguracionGeneralRepository();
    const [ingresoPorReparacion, headerConfig] = await Promise.all([
      ingresoReparacionRepository.findById(id),
      configRepo.findByNombre("Encabezado PDF"),
    ]);
    if (!ingresoPorReparacion) {
      throw new Error("Ingreso por reparación no encontrado");
    }
    const pdfBuffer = await this.reciboService.generarReciboPdf(
      ingresoPorReparacion,
      headerConfig?.valor,
    );
    return pdfBuffer;
  }
}
