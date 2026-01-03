import type {
  CreateOrdenPersist,
  ListOrdenesParams,
  OrdenReparacionRepository,
  UpdateOrdenPersist,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { EstadoOrdenReparacion } from "@prisma/client";

export class PrismaOrdenReparacionRepository
  implements OrdenReparacionRepository
{
  async listPaged<T = any>({
    page,
    size,
    query = "",
    estado,
  }: ListOrdenesParams): Promise<PageResult<T>> {
    const where: any = {
      OR: [
        { auto: { patent: { contains: query } } },
        { id: { equals: Number(query) || undefined } },
        { auto: { owner: { fullName: { contains: query } } } },
        { observacionesCliente: { contains: query } },
      ],
    };
    if (estado) where.estado = estado;

    if (query?.trim()) {
      const rows = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM OrdenReparacion
        WHERE DATE_FORMAT(fechaEntradaReparacion, '%e/%c/%Y') LIKE ${`%${query}%`}
      `;
      const ids = rows.map((r) => r.id);
      if (ids.length) where.OR.push({ id: { in: ids } });
    }

    return prismaPaged<T>(
      prisma.ordenReparacion,
      {
        where,
        orderBy: { id: "desc" },
        include: {
          auto: { include: { owner: true } },
          mecanicos: true,
          controlesEnReparacion: { include: { controlMecanico: true } },
          repuestosUsados: {
            include: {
              stock: true,
            },
          },
          reparacionesDeTercero: {
            include: {
              proveedor: true,
              reciboFile: true,
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
      page,
      size
    );
  }

  async findMatchingIdsByFormattedDate(query: string) {
    const rows = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM OrdenReparacion
      WHERE DATE_FORMAT(fechaEntradaReparacion, '%e/%c/%Y') LIKE ${`%${query}%`}
    `;
    return rows.map((r) => r.id);
  }

  async create(tx: any, payload: CreateOrdenPersist["data"]) {
    return tx.ordenReparacion.create(payload);
  }

  async update(tx: any, payload: UpdateOrdenPersist["data"]) {
    return tx.ordenReparacion.update(payload);
  }

  async findById(id: number) {
    return prisma.ordenReparacion.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: {
          include: {
            mecanico: true,
          },
        },
        repuestosUsados: {
          include: {
            stock: {
              include: {
                proveedor: true,
              },
            },
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
            reciboFile: true,
          },
        },
        ingresos: {
          include: {
            dolar: true,
          },
        },
        trabajosRealizados: true,
        revisadoPor: true,
        controlesEnReparacion: {
          include: {
            controlMecanico: {
              include: {
                parent: true,
              },
            },
          },
        },
        pagos: true,
        recibosFiles: true,
        scannerFile: true,
      },
    });
  }

  async delete(tx: any, id: number) {
    const db = tx?.tx ?? prisma;
    await db.ordenReparacion.delete({ where: { id } });
  }

  async listForCliente(clienteId: number) {
    return prisma.ordenReparacion.findMany({
      where: {
        auto: {
          ownerId: clienteId,
        },
        estado: {
          not: EstadoOrdenReparacion.Presupuestado,
        },
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: true,
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
    });
  }

  async patchOrden(
    id: number,
    dto: {
      autoId?: number;
      kilometros?: number | null;
      observacionesCliente?: string;
      observacionesEntrada?: string;
      estado?: string;
      observacionesInternas?: string;
      observacionesSalida?: string;
      observacionesOcultas?: string | null;
      fechaEntradaReparacion?: Date | null;
      fechaSalidaReparacion?: Date | null;
      controlesEnReparacion?: Array<{ id: number; valor: string }>;
      revisadoPorId?: number | null;
      detalleControles?: string;
    }
  ) {
    const dataToUpdate: any = {};

    if (dto.autoId !== undefined) dataToUpdate.autoId = dto.autoId;
    if (dto.kilometros !== undefined) dataToUpdate.kilometros = dto.kilometros;
    if (dto.observacionesCliente !== undefined)
      dataToUpdate.observacionesCliente = dto.observacionesCliente;
    if (dto.observacionesEntrada !== undefined)
      dataToUpdate.observacionesEntrada = dto.observacionesEntrada;
    if (dto.estado !== undefined) dataToUpdate.estado = dto.estado;
    if (dto.observacionesInternas !== undefined)
      dataToUpdate.observacionesInternas = dto.observacionesInternas;
    if (dto.observacionesSalida !== undefined)
      dataToUpdate.observacionesSalida = dto.observacionesSalida;
    if (dto.observacionesOcultas !== undefined)
      dataToUpdate.observacionesOcultas = dto.observacionesOcultas;
    if (dto.fechaEntradaReparacion !== undefined)
      dataToUpdate.fechaEntradaReparacion = dto.fechaEntradaReparacion;
    if (dto.fechaSalidaReparacion !== undefined)
      dataToUpdate.fechaSalidaReparacion = dto.fechaSalidaReparacion;
    if (dto.revisadoPorId !== undefined)
      dataToUpdate.revisadoPorId = dto.revisadoPorId;
    if (dto.detalleControles !== undefined)
      dataToUpdate.detalleControles = dto.detalleControles;

    if (dto.controlesEnReparacion !== undefined) {
      const controlIds = dto.controlesEnReparacion.map((c) => c.id);

      dataToUpdate.controlesEnReparacion = {
        deleteMany: {
          controlMecanicoId: {
            notIn: controlIds,
          },
        },
        upsert: dto.controlesEnReparacion.map((control) => ({
          where: {
            ordenReparacionId_controlMecanicoId: {
              ordenReparacionId: id,
              controlMecanicoId: control.id,
            },
          },
          update: {
            valor: control.valor,
          },
          create: {
            controlMecanicoId: control.id,
            valor: control.valor,
          },
        })),
      };
    }

    return prisma.ordenReparacion.update({
      where: { id },
      data: dataToUpdate,
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: {
          include: {
            mecanico: true,
          },
        },
        repuestosUsados: {
          include: {
            stock: {
              include: {
                proveedor: true,
              },
            },
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
            reciboFile: true,
          },
        },
        ingresos: {
          include: {
            dolar: true,
          },
        },
        trabajosRealizados: true,
        revisadoPor: true,
        controlesEnReparacion: {
          include: {
            controlMecanico: {
              include: {
                parent: true,
              },
            },
          },
        },
        pagos: true,
        recibosFiles: true,
        scannerFile: true,
      },
    });
  }

  async createDraft(data: any) {
    return prisma.ordenReparacion.create({
      data,
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    });
  }

  async addMecanicoToOrden(
    ordenReparacionId: number,
    mecanicoId: number,
    detalle?: string | null
  ) {
    return prisma.ordenReparacionMecanico.create({
      data: {
        ordenReparacionId,
        mecanicoId,
        detalle,
      },
      include: {
        mecanico: true,
        ordenReparacion: true,
      },
    });
  }

  async updateMecanicoInOrden(id: number, detalle: string | null) {
    return prisma.ordenReparacionMecanico.update({
      where: { id } as any,
      data: { detalle },
      include: {
        mecanico: true,
        ordenReparacion: true,
      },
    });
  }

  async deleteMecanicoFromOrden(id: number) {
    return prisma.ordenReparacionMecanico.delete({
      where: { id } as any,
    });
  }
}
