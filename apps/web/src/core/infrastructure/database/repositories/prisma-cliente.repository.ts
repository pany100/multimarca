import { ClienteRepository } from "@/core/domain/repositories/cliente.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaClienteRepository implements ClienteRepository {
  findById(id: number) {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        cars: {
          include: {
            ordenesReparacion: {
              include: {
                repuestosUsados: true,
                reparacionesDeTercero: true,
                trabajosRealizados: true,
                auto: true,
                ingresos: true,
              },
              orderBy: {
                fechaCreacion: "desc",
              },
            },
          },
        },
        ventas: {
          include: {
            ingresos: true,
          },
        },
      },
    });
  }
}
