import { UpdateRevisadoYEnviadoDto } from "@/core/application/dto/resumen.dto";
import { TransaccionRepository } from "@/core/domain/repositories/transaccion.repository";
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

export class PrismaIngresoReparacionRepository
  implements TransaccionRepository
{
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

  async update(dto: UpdateRevisadoYEnviadoDto) {
    const data: { revisado?: boolean; reciboEnviado?: boolean } = {};
    if (dto.revisado !== undefined) data.revisado = dto.revisado;
    if (dto.reciboEnviado !== undefined) data.reciboEnviado = dto.reciboEnviado;
    return prisma.ingresoPorReparacion.update({
      where: { id: dto.id },
      data,
    });
  }
}
