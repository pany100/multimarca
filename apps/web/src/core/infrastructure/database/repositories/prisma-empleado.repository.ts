import { EmpleadoRepository } from "@/core/domain/repositories/empleado.repository";
import { EmpleadoVO } from "@/core/domain/value-objects/empleado-vo";
import { prisma } from "@/core/infrastructure/database/prisma";
import { ListMecanicosQueryData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { Empleado } from "@prisma/client";

export class PrismaEmpleadoRepository implements EmpleadoRepository {
  listPaged(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>> {
    return prismaPaged<Empleado>(
      prisma.empleado,
      {
        where: {
          name: { contains: dto.query },
          tipo: dto.soloMecanicos ? "Mecanico" : undefined,
        },
        orderBy: { id: "desc" },
      },
      dto.page,
      dto.size
    );
  }

  create(empleado: EmpleadoVO): Promise<Empleado> {
    return prisma.empleado.create({
      data: {
        name: empleado.name,
        start_date: empleado.startDate,
        dni: empleado.dni,
        address: empleado.address,
        city: empleado.city,
        state: empleado.state,
        postal_code: empleado.postalCode,
        email: empleado.email,
        phone: empleado.phone,
        tipo: empleado.tipo,
        birthday: empleado.birthday,
        dniImagePath: empleado.dniImagePath,
      },
    });
  }

  findById(id: number): Promise<Empleado | null> {
    return prisma.empleado.findUnique({
      where: { id },
    });
  }

  async delete(id: number): Promise<Empleado | null> {
    return prisma.empleado.delete({
      where: { id },
    });
  }

  update(empleado: EmpleadoVO): Promise<Empleado> {
    if (!empleado.id) {
      throw new Error("El ID del empleado es requerido");
    }
    return prisma.empleado.update({
      where: { id: empleado.id },
      data: {
        name: empleado.name,
        start_date: empleado.startDate,
        dni: empleado.dni,
        address: empleado.address,
        city: empleado.city,
        state: empleado.state,
        postal_code: empleado.postalCode,
        email: empleado.email,
        phone: empleado.phone,
        tipo: empleado.tipo,
        birthday: empleado.birthday,
        dniImagePath: empleado.dniImagePath,
        contactoEmergencia: empleado.contactoEmergencia,
      },
    });
  }

  getReparacionesEmpleado(id: number, from: Date, to: Date): Promise<any> {
    return prisma.ordenReparacion.findMany({
      where: {
        mecanicos: {
          some: {
            mecanicoId: id,
          },
        },
        fechaSalidaReparacion: {
          gte: from,
          lte: to,
        },
      },
      include: {
        mecanicos: {
          include: {
            mecanico: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        trabajosRealizados: true,
        pagos: true,
        auto: {
          select: {
            id: true,
            patent: true,
          },
        },
      },
      orderBy: {
        fechaSalidaReparacion: "desc",
      },
    });
  }
}
