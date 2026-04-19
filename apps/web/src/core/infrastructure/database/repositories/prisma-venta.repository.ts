import {
  ListVentasParams,
  VentaRepository,
  VentaWithRelations,
} from "@/core/domain/repositories/venta.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { EstadoArchivo, EstadoVenta, Prisma, Venta } from "@prisma/client";

export class PrismaVentaRepository implements VentaRepository {
  create(
    tx: Prisma.TransactionClient,
    data: Prisma.VentaCreateInput
  ): Promise<Venta> {
    return tx.venta.create({ data });
  }

  listPaged(args: ListVentasParams): Promise<PageResult<VentaWithRelations>> {
    const { page, size, query, estado, from, to } = args;
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

    if (from || to) {
      where.fecha = {};
      if (from) where.fecha.gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        where.fecha.lte = endDate;
      }
    }
    return prismaPaged<VentaWithRelations>(
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
          reparacionesDeTercero: {
            include: {
              proveedor: true,
              reciboFile: true,
            },
          },
          trabajosRealizados: true,
          ajustesPrecio: { orderBy: { orden: "asc" } },
          ingresos: {
            include: {
              dolar: true,
            },
          },
          mecanicos: {
            include: {
              mecanico: true,
            },
          },
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
        cedulaFile: true,
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
        trabajosRealizados: true,
        ingresos: {
          include: {
            dolar: true,
          },
        },
        ajustesPrecio: { orderBy: { orden: "asc" } },
        mecanicos: {
          include: {
            mecanico: true,
          },
        },
      },
    });
  }

  async update(
    tx: any,
    data: Prisma.VentaUpdateArgs
  ): Promise<VentaWithRelations> {
    const db = tx?.tx ?? prisma;
    return db.venta.update({
      ...data,
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
        ajustesPrecio: { orderBy: { orden: "asc" } },
        ingresos: true,
        mecanicos: {
          include: {
            mecanico: true,
          },
        },
      },
    });
  }

  async patchVenta(
    id: number,
    dto: {
      clienteId?: number | null;
      informacionCliente?: string | null;
      cedulaFilePath?: string | null;
      fecha?: Date;
      descuento?: number | null;
      descripcionDescuento?: string | null;
      incremento?: number | null;
      descripcionIncremento?: string | null;
      porcentajeRecargo?: number | null;
      estado?: string;
      ajustesPrecio?: Array<{
        descripcion: string;
        monto: number;
        tipo: string;
        esDescuento: boolean;
        esInterno: boolean;
        orden: number;
      }>;
      modoAjustes?: string;
      descuentoParaManoDeObra?: number | null;
    }
  ): Promise<VentaWithRelations> {
    const currentVenta = await prisma.venta.findUnique({
      where: { id },
      select: { cedulaFile: true },
    });

    // Cedula: si hay clienteId (cliente existente) borramos cedula si existía; no guardamos cedulaFilePath. Si no hay clienteId (cliente nuevo) y se envía cedulaFilePath, crear/actualizar CustomFile.
    if (dto.clienteId != null) {
      if (currentVenta?.cedulaFile) {
        await prisma.customFile.update({
          where: { id: currentVenta.cedulaFile.id },
          data: {
            ventaCedulaId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
    } else if (dto.cedulaFilePath !== undefined) {
      const existingCedula = currentVenta?.cedulaFile;
      if (dto.cedulaFilePath) {
        if (existingCedula) {
          await prisma.customFile.update({
            where: { id: existingCedula.id },
            data: {
              ventaCedulaId: null,
              status: EstadoArchivo.ListoParaBorrar,
            },
          });
        }
        await prisma.customFile.create({
          data: {
            tempPath: dto.cedulaFilePath,
            ventaCedulaId: id,
          },
        });
      } else if (existingCedula) {
        await prisma.customFile.update({
          where: { id: existingCedula.id },
          data: {
            ventaCedulaId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
    }

    const updateData: Prisma.VentaUpdateInput = {};

    if (dto.clienteId !== undefined) {
      updateData.cliente = dto.clienteId
        ? { connect: { id: dto.clienteId } }
        : { disconnect: true };
    }
    if (dto.informacionCliente !== undefined)
      updateData.informacionCliente = dto.informacionCliente;
    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.estado !== undefined) updateData.estado = dto.estado as any;

    // Handle Decimal conversions
    if (dto.descuento !== undefined) {
      updateData.descuento = (
        dto.descuento !== null ? new Prisma.Decimal(dto.descuento) : null
      ) as any;
    }
    if (dto.descripcionDescuento !== undefined) {
      updateData.descripcionDescuento = dto.descripcionDescuento;
    }
    if (dto.incremento !== undefined) {
      updateData.incremento = (
        dto.incremento !== null ? new Prisma.Decimal(dto.incremento) : null
      ) as any;
    }
    if (dto.descripcionIncremento !== undefined) {
      updateData.descripcionIncremento = dto.descripcionIncremento;
    }
    if (dto.porcentajeRecargo !== undefined) {
      updateData.porcentajeRecargo = (
        dto.porcentajeRecargo !== null
          ? new Prisma.Decimal(dto.porcentajeRecargo)
          : null
      ) as any;
    }

    if (dto.descuentoParaManoDeObra !== undefined) {
      updateData.descuentoParaManoDeObra = new Prisma.Decimal(
        dto.descuentoParaManoDeObra ?? 0,
      );
    }

    if (dto.modoAjustes !== undefined) {
      updateData.modoAjustes = dto.modoAjustes as any;
    }

    if (dto.ajustesPrecio !== undefined) {
      updateData.ajustesPrecio = {
        deleteMany: {},
        createMany: {
          data: dto.ajustesPrecio.map((a, idx) => ({
            descripcion: a.descripcion,
            monto: a.monto,
            tipo: a.tipo as any,
            esDescuento: a.esDescuento,
            esInterno: a.esInterno ?? false,
            orden: a.orden ?? idx,
          })),
        },
      };
    }

    return prisma.venta.update({
      where: { id },
      data: updateData,
      include: {
        cliente: true,
        cedulaFile: true,
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
        trabajosRealizados: true,
        ingresos: {
          include: {
            dolar: true,
          },
        },
        mecanicos: {
          include: {
            mecanico: true,
          },
        },
      },
    });
  }

  async addMecanicoToVenta(
    ventaId: number,
    mecanicoId: number,
    detalle?: string | null
  ) {
    return prisma.ventaMecanico.create({
      data: { ventaId, mecanicoId, detalle },
      include: { mecanico: true, venta: true },
    });
  }

  async updateMecanicoInVenta(id: number, detalle?: string | null) {
    return prisma.ventaMecanico.update({
      where: { id },
      data: { detalle },
      include: { mecanico: true, venta: true },
    });
  }

  async deleteMecanicoFromVenta(id: number) {
    return prisma.ventaMecanico.delete({ where: { id } });
  }
}
