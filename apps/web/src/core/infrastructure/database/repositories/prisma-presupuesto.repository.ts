import {
  ListPresupuestosParams,
  PresupuestoRepository,
  PresupuestoWithRelations,
} from "@/core/domain/repositories/presupuesto.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { Presupuesto, Prisma } from "@prisma/client";

export class PrismaPresupuestoRepository implements PresupuestoRepository {
  async listPaged<T = any>({
    page,
    size,
    query = "",
    estado,
    sortBy,
    sortOrder,
    from,
    to,
  }: ListPresupuestosParams): Promise<PageResult<T>> {
    let where: any = {
      OR: [
        { auto: { brand: { contains: query } } },
        { id: { equals: parseInt(query || "") || undefined } },
        { informacionAuto: { contains: query } },
        { informacionCliente: { contains: query } },
        { auto: { model: { contains: query } } },
        { auto: { patent: { contains: query } } },
        { auto: { owner: { fullName: { contains: query } } } },
        { observacionesCliente: { contains: query } },
        { administrativo: { fullName: { contains: query } } },
        { detallesDeTrabajo: { contains: query } },
      ],
    };

    // Filter by estado if provided
    if (estado) {
      where.estado = estado;
    }

    if (from || to) {
      where.fecha = {};

      if (from) {
        // Convertir YYYY-MM-DD a objeto Date
        where.fecha.gte = new Date(from);
      }

      if (to) {
        // Convertir YYYY-MM-DD a objeto Date y establecer a final del día
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        where.fecha.lte = endDate;
      }
    }

    // Build the orderBy object
    const orderBy: any = {};
    orderBy[sortBy || "fecha"] = sortOrder;

    return prismaPaged<T>(
      prisma.presupuesto,
      {
        where,
        orderBy,
        include: {
          auto: {
            include: {
              owner: true,
            },
          },
          administrativo: true,
          creador: true,
          dolar: true,
          repuestosUsados: {
            include: {
              stock: true,
            },
          },
          reparacionesDeTercero: {
            include: {
              proveedor: true,
            },
          },
          tareasAdministrativas: {
            include: {
              usuario: true,
            },
          },
          trabajosRealizados: true,
        },
      },
      page,
      size
    );
  }

  async create(data: Prisma.PresupuestoCreateArgs): Promise<Presupuesto> {
    return prisma.presupuesto.create(data);
  }

  async findById(id: number): Promise<PresupuestoWithRelations | null> {
    return prisma.presupuesto.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        administrativo: true,
        creador: true,
        dolar: true,
        reparacionesDeTercero: {
          include: {
            proveedor: true,
            reciboFile: true,
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
        trabajosRealizados: true,
        tareasAdministrativas: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.presupuesto.delete({
      where: { id },
    });
  }
}
