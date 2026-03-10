import type {
  CreateTurnoData,
  ListTurnosParams,
  ListTurnosResult,
  TurnoRepository,
  UpdateTurnoData,
} from "@/core/domain/repositories/turno.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

const includeAutoOwner = {
  auto: {
    include: {
      owner: true,
    },
  },
} as const;

export class PrismaTurnoRepository implements TurnoRepository {
  async findMany(params: ListTurnosParams): Promise<ListTurnosResult> {
    const { page, size, query, fecha, future } = params;
    const skip = page * size;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      OR: query
        ? [
            { problema: { contains: query } },
            { informacionAuto: { contains: query } },
            { informacionPatente: { contains: query } },
            { clienteNombre: { contains: query } },
            { clienteTelefono: { contains: query } },
            { auto: { patent: { contains: query } } },
            { auto: { owner: { fullName: { contains: query } } } },
          ]
        : undefined,
      ...(fecha && { fecha: new Date(fecha) }),
      ...(future && { fecha: { gte: today } }),
    };

    const [items, total] = await Promise.all([
      prisma.turno.findMany({
        where,
        include: includeAutoOwner,
        skip,
        take: size,
        orderBy: [{ fecha: "desc" }, { hora: "desc" }],
      }),
      prisma.turno.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findById(id: number): Promise<any | null> {
    return prisma.turno.findUnique({
      where: { id },
      include: includeAutoOwner,
    });
  }

  async create(data: CreateTurnoData): Promise<any> {
    return prisma.turno.create({
      data: {
        hora: data.hora,
        fecha: data.fecha,
        problema: data.problema,
        autoId: data.autoId,
        informacionAuto: data.informacionAuto,
        informacionPatente: data.informacionPatente,
        presupuestoId: data.presupuestoId,
        clienteNombre: data.clienteNombre,
        clienteTelefono: data.clienteTelefono,
        vino: data.vino,
        observaciones: data.observaciones,
      },
      include: includeAutoOwner,
    });
  }

  async update(id: number, data: UpdateTurnoData): Promise<any> {
    return prisma.turno.update({
      where: { id },
      data: {
        hora: data.hora,
        fecha: data.fecha,
        problema: data.problema,
        autoId: data.autoId,
        informacionAuto: data.informacionAuto,
        informacionPatente: data.informacionPatente,
        presupuestoId: data.presupuestoId,
        clienteNombre: data.clienteNombre,
        clienteTelefono: data.clienteTelefono,
        vino: data.vino,
        observaciones: data.observaciones,
      },
      include: includeAutoOwner,
    });
  }

  async updateVino(id: number, vino: boolean): Promise<any> {
    return prisma.turno.update({
      where: { id },
      data: { vino },
      include: includeAutoOwner,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.turno.delete({
      where: { id },
    });
  }
}
