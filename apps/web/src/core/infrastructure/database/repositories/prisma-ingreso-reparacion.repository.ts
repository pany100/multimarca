import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export type IngresoPorReparacionWithRelations =
  Prisma.IngresoPorReparacionGetPayload<{
    include: {
      cliente: true;
      ordenReparacion: {
        include: {
          auto: true;
          repuestosUsados: {
            include: {
              stock: true;
            };
          };
          reparacionesDeTercero: true;
          trabajosRealizados: true;
          ingresos: {
            include: {
              dolar: true;
            };
          };
        };
      };
    };
  }>;

export class PrismaIngresoReparacionRepository {
  async findById(
    id: number
  ): Promise<IngresoPorReparacionWithRelations | null> {
    return prisma.ingresoPorReparacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        ordenReparacion: {
          include: {
            auto: true,
            repuestosUsados: {
              include: {
                stock: true,
              },
            },
            reparacionesDeTercero: true,
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
