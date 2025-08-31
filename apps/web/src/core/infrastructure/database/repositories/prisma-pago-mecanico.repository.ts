import {
  PagoMecanicoData,
  PagoMecanicoRepository,
} from "@/core/domain/repositories/pago-mecanico.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaPagoMecanicoRepository implements PagoMecanicoRepository {
  create(data: PagoMecanicoData): Promise<any> {
    return prisma.pagoAMecanico.create({ data });
  }
  findByOrdenId(id: number): Promise<any> {
    return prisma.pagoAMecanico.findFirst({
      where: {
        ordenReparacionId: id,
      },
    });
  }
}
