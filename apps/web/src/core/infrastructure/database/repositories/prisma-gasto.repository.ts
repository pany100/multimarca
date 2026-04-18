import { UpdateRevisadoYEnviadoDto } from "@/core/application/dto/resumen.dto";
import {
  GastoRepository,
  ListGastosParams,
} from "@/core/domain/repositories/gasto.repository";
import { TransaccionRepository } from "@/core/domain/repositories/transaccion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { chequeQueryData } from "@/utils/chequeUtils";

export class PrismaGastoRepository
  implements TransaccionRepository, GastoRepository
{
  async listPaged(args: ListGastosParams): Promise<PageResult<any>> {
    const { page, size, query, from, to, userRoleName } = args;

    const whereClause: any = {
      OR: [
        { id: { equals: parseInt(query) || undefined } },
        { nombre: { contains: query } },
        { categoria: { nombre: { contains: query } } },
        { mecanico: { name: { contains: query } } },
        { detalle: { contains: query } },
        { proveedor: { name: { contains: query } } },
      ],
      AND: [
        {
          categoria: {
            OR: [
              { roles: { none: {} } },
              { roles: { some: { name: userRoleName } } },
            ],
          },
        },
      ],
    };

    if (query && query.trim() !== "") {
      const formattedDateMatches = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM Gasto
        WHERE DATE_FORMAT(fecha, '%e/%c/%Y') LIKE ${`%${query}%`}
      `;
      if (formattedDateMatches.length > 0) {
        const matchingIds = formattedDateMatches.map((match) => match.id);
        whereClause.OR.push({ id: { in: matchingIds } });
      }
    }

    if (from || to) {
      const fechaFilter: any = {};
      if (from) fechaFilter.gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        fechaFilter.lte = endDate;
      }
      whereClause.AND.push({ fecha: fechaFilter });
    }

    return prismaPaged(
      prisma.gasto,
      {
        where: whereClause,
        include: {
          categoria: {
            include: {
              roles: true,
            },
          },
          tipoOperacion: true,
          mecanico: true,
          proveedor: true,
          cheque: chequeQueryData,
        },
        orderBy: [
          { fecha: "desc" },
          { categoriaId: "asc" },
          { proveedorId: "asc" },
          { mecanicoId: "asc" },
        ],
      },
      page,
      size
    );
  }

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
        fechaBaja: null,
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
                  where: {
                    mecanico: {
                      is: {
                        fechaBaja: null,
                      },
                    },
                  },
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
                incrementoInterno: true,
                incremento: true,
                porcentajeRecargo: true,
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
        incrementoInterno: true,
        incremento: true,
        porcentajeRecargo: true,
        auto: {
          select: {
            brand: true,
            model: true,
            patent: true,
          },
        },
        mecanicos: {
          where: {
            mecanico: {
              is: {
                fechaBaja: null,
              },
            },
          },
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
