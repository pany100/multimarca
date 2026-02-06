import {
  ListPresupuestosParams,
  PresupuestoRepository,
  PresupuestoWithRelations,
} from "@/core/domain/repositories/presupuesto.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { EstadoArchivo, Presupuesto, Prisma } from "@prisma/client";

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
        cedulaFile: true,
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

  async update(
    data: Prisma.PresupuestoUpdateArgs
  ): Promise<PresupuestoWithRelations> {
    return prisma.presupuesto.update({
      ...data,
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

  async patchPresupuesto(
    id: number,
    dto: {
      autoId?: number | null;
      observacionesCliente?: string;
      detallesDeTrabajo?: string | null;
      informacionAuto?: string | null;
      informacionCliente?: string | null;
      cedulaFilePath?: string | null;
      estado?: string;
      fecha?: Date;
      fechaRespuesta?: Date | null;
      fechaEnvio?: Date | null;
      descuento?: number | null;
      porcentajeRecargo?: number | null;
      descripcionDescuento?: string | null;
      incrementoInterno?: number | null;
      incremento?: number | null;
      descripcionIncremento?: string | null;
    }
  ): Promise<PresupuestoWithRelations> {
    const currentPresupuesto = await prisma.presupuesto.findUnique({
      where: { id },
      select: { cedulaFile: true },
    });

    // Cedula: si hay autoId (vehículo existente) borramos cedula si existía; no guardamos cedulaFilePath. Si no hay autoId (vehículo nuevo) y se envía cedulaFilePath, crear/actualizar CustomFile.
    if (dto.autoId != null) {
      if (currentPresupuesto?.cedulaFile) {
        await prisma.customFile.update({
          where: { id: currentPresupuesto.cedulaFile.id },
          data: {
            presupuestoCedulaId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
    } else if (dto.cedulaFilePath !== undefined) {
      const existingCedula = currentPresupuesto?.cedulaFile;
      if (dto.cedulaFilePath) {
        if (existingCedula) {
          await prisma.customFile.update({
            where: { id: existingCedula.id },
            data: {
              presupuestoCedulaId: null,
              status: EstadoArchivo.ListoParaBorrar,
            },
          });
        }
        await prisma.customFile.create({
          data: {
            tempPath: dto.cedulaFilePath,
            presupuestoCedulaId: id,
          },
        });
      } else if (existingCedula) {
        await prisma.customFile.update({
          where: { id: existingCedula.id },
          data: {
            presupuestoCedulaId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
    }

    const dataToUpdate: any = {};

    // Solo incluir campos que están definidos en el dto
    if (dto.autoId !== undefined) dataToUpdate.autoId = dto.autoId;
    if (dto.observacionesCliente !== undefined)
      dataToUpdate.observacionesCliente = dto.observacionesCliente;
    if (dto.detallesDeTrabajo !== undefined)
      dataToUpdate.detallesDeTrabajo = dto.detallesDeTrabajo;
    if (dto.informacionAuto !== undefined)
      dataToUpdate.informacionAuto = dto.informacionAuto;
    if (dto.informacionCliente !== undefined)
      dataToUpdate.informacionCliente = dto.informacionCliente;
    if (dto.estado !== undefined) dataToUpdate.estado = dto.estado;
    if (dto.fecha !== undefined) dataToUpdate.fecha = dto.fecha;
    if (dto.fechaRespuesta !== undefined)
      dataToUpdate.fechaRespuesta = dto.fechaRespuesta;
    if (dto.fechaEnvio !== undefined) dataToUpdate.fechaEnvio = dto.fechaEnvio;
    if (dto.descuento !== undefined)
      dataToUpdate.descuento =
        dto.descuento !== null ? new Prisma.Decimal(dto.descuento) : null;
    if (dto.porcentajeRecargo !== undefined)
      dataToUpdate.porcentajeRecargo =
        dto.porcentajeRecargo !== null
          ? new Prisma.Decimal(dto.porcentajeRecargo)
          : null;
    if (dto.descripcionDescuento !== undefined)
      dataToUpdate.descripcionDescuento = dto.descripcionDescuento;
    if (dto.incrementoInterno !== undefined)
      dataToUpdate.incrementoInterno =
        dto.incrementoInterno !== null
          ? new Prisma.Decimal(dto.incrementoInterno)
          : null;
    if (dto.incremento !== undefined)
      dataToUpdate.incremento =
        dto.incremento !== null ? new Prisma.Decimal(dto.incremento) : null;
    if (dto.descripcionIncremento !== undefined)
      dataToUpdate.descripcionIncremento = dto.descripcionIncremento;

    return prisma.presupuesto.update({
      where: { id },
      data: dataToUpdate,
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        administrativo: true,
        creador: true,
        dolar: true,
        cedulaFile: true,
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
}
