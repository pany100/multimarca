import { ControlMecanicoRepository } from "@/core/domain/repositories/control-mecanico.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaControlMecanicoRepository
  implements ControlMecanicoRepository
{
  findMany(): Promise<any[]> {
    return prisma.controlMecanico.findMany();
  }
}
