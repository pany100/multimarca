import {
  PagoMecanicoData,
  PagoMecanicoRepository,
} from "@/core/domain/repositories/pago-mecanico.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaPagoMecanicoRepository implements PagoMecanicoRepository {
  create(data: PagoMecanicoData, deps?: { tx?: any }): Promise<any> {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    return db.pagoAMecanico.create({ data });
  }
  findByOrdenId(id: number): Promise<any> {
    return prisma.pagoAMecanico.findFirst({
      where: {
        ordenReparacionId: id,
      },
    });
  }
}
