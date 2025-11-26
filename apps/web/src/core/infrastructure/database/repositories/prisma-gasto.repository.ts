import { UpdateRevisadoYEnviadoDto } from "@/core/application/dto/resumen.dto";
import { GastoRepository } from "@/core/domain/repositories/gasto.repository";
import { TransaccionRepository } from "@/core/domain/repositories/transaccion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaGastoRepository
  implements TransaccionRepository, GastoRepository
{
  async update(dto: UpdateRevisadoYEnviadoDto) {
    return prisma.gasto.update({
      where: { id: dto.id },
      data: {
        revisado: dto.revisado || false,
      },
    });
  }

  async getGastoMecanicosUltimaSemana(from: Date, to: Date) {
    return prisma.empleado.findMany({
      where: {
        tipo: "Mecanico",
      },
      select: {
        id: true,
        name: true,
        ordenesReparacion: {
          where: {
            ordenReparacion: {
              estado: "Terminado",
              fechaSalidaReparacion: {
                gte: from,
                lte: to,
              },
            },
          },
          select: {
            ordenReparacion: {
              select: {
                id: true,
                fechaSalidaReparacion: true,
                auto: {
                  select: {
                    patent: true,
                  },
                },
                mecanicos: {
                  select: {
                    mecanicoId: true,
                  },
                },
                trabajosRealizados: true,
                reparacionesDeTercero: true,
                repuestosUsados: {
                  include: {
                    stock: true,
                  },
                },
                descuento: true,
                pagos: {
                  select: {
                    fechaPago: true,
                    monto: true,
                  },
                  where: {
                    AND: [
                      { fechaPago: { not: null } },
                      { monto: { not: null } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getGastoMecanicosUltimaSemanaCompartida(from: Date, to: Date) {
    return await prisma.ordenReparacion.findMany({
      where: {
        estado: "Terminado",
        fechaSalidaReparacion: {
          gte: from,
          lte: to,
        },
        // Only repairs with more than one mechanic
        mecanicos: {
          some: {}, // At least one mechanic exists
        },
      },
      select: {
        id: true,
        fechaSalidaReparacion: true,
        descuento: true,
        auto: {
          select: {
            brand: true,
            model: true,
            patent: true,
          },
        },
        mecanicos: {
          select: {
            mecanico: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        trabajosRealizados: true,
        reparacionesDeTercero: true,
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        pagos: {
          select: {
            fechaPago: true,
            monto: true,
          },
          where: {
            AND: [{ fechaPago: { not: null } }, { monto: { not: null } }],
          },
        },
      },
    });
  }
}
