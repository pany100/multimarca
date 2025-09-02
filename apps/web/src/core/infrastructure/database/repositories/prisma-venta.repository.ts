import {
  ListVentasParams,
  VentaRepository,
} from "@/core/domain/repositories/venta.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { EstadoVenta, Prisma, Venta } from "@prisma/client";

export class PrismaVentaRepository implements VentaRepository {
  create(
    tx: Prisma.TransactionClient,
    data: Prisma.VentaCreateInput
  ): Promise<Venta> {
    return tx.venta.create({ data });
  }

  listPaged(args: ListVentasParams): Promise<PageResult<Venta>> {
    const { page, size, query, estado } = args;
    const where: Prisma.VentaWhereInput = {
      OR: [
        { cliente: { fullName: { contains: query } } },
        { informacionCliente: { contains: query } },
        { id: { equals: parseInt(query) || undefined } },
      ],
    };

    // Add estado filter if provided
    if (estado) {
      where.estado = estado as EstadoVenta;
    }
    return prismaPaged<Venta>(
      prisma.venta,
      {
        where,
        include: {
          cliente: true,
          repuestosUsados: {
            include: {
              stock: true,
            },
          },
          reparacionesDeTercero: true,
          trabajosRealizados: true,
          ingresos: true,
        },
        orderBy: { id: "desc" },
      },
      page,
      size
    );
  }

  async delete(tx: any, id: number) {
    const db = tx?.tx ?? prisma;
    await db.venta.delete({ where: { id } });
  }

  async findById(id: number) {
    return prisma.venta.findUnique({
      where: { id },
      include: {
        cliente: true,
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
        ingresos: true,
      },
    });
  }
}
