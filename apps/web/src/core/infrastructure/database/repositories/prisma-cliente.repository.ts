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
                reparacionesDeTercero: true,
                repuestosUsados: {
                  include: {
                    stock: true,
                  },
                },
                trabajosRealizados: true,
                ingresos: {
                  include: {
                    dolar: true,
                  },
                },
              },
              orderBy: {
                fechaCreacion: "desc",
              },
            },
          },
        },
        ventas: {
          include: {
            reparacionesDeTercero: true,
            repuestosUsados: {
              include: {
                stock: true,
              },
            },
            trabajosRealizados: true,
            ingresos: {
              include: {
                dolar: true,
              },
            },
          },
        },
      },
    });
  }
}
