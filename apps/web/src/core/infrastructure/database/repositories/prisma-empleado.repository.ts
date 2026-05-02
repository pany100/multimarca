import { EmpleadoRepository } from "@/core/domain/repositories/empleado.repository";
import { OrdenReparacionWithRelations } from "@/core/domain/repositories/orden-reparacion.repository";
import { EmpleadoVO } from "@/core/domain/value-objects/empleado-vo";
import { prisma } from "@/core/infrastructure/database/prisma";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import {
  ListMecanicosQueryData,
  UpdateMecanicoDocsData,
} from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { Empleado, EstadoArchivo } from "@prisma/client";

export class PrismaEmpleadoRepository implements EmpleadoRepository {
  listPaged(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>> {
    return prismaPaged<Empleado>(
      prisma.empleado,
      {
        where: {
          OR: [
            { name: { contains: dto.query } },
            { id: { equals: parseInt(dto.query || "") || undefined } },
          ],
          tipo: dto.soloMecanicos ? "Mecanico" : undefined,
          fechaBaja: null,
        },
        orderBy: { id: "desc" },
        include: {
          dniFrentePath: true,
          dniDorsoPath: true,
          licenciaDorsoPath: true,
        },
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
        claveFiscal: empleado.claveFiscal,
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
      include: {
        ausenciasProgramadas: true,
        inasistencias: { include: { certificadoMedicoPath: true } },
        llegadasTarde: { include: { certificadoPath: true } },
        horasExtra: true,
        premios: true,
        apercibimientos: true,
        certificadosEstudio: { include: { ruta: true } },
        sueldos: true,
        notasAdministrativas: true,
        licenciaConducirPath: true,
        licenciaDorsoPath: true,
        inscripcionMonotributoPath: true,
        recategorizacionMonotributoPath: true,
        curriculumPath: true,
        credencialPagoPath: true,
        dniFrentePath: true,
        dniDorsoPath: true,
      },
    });
  }

  async delete(id: number): Promise<Empleado | null> {
    return prisma.empleado.update({
      where: { id },
      data: { fechaBaja: new Date() },
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
        claveFiscal: empleado.claveFiscal,
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

  getReparacionesEmpleado(
    id: number,
    from: Date,
    to: Date
  ): Promise<OrdenReparacionWithRelations[]> {
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
      },
      orderBy: {
        fechaSalidaReparacion: "desc",
      },
    });
  }

  async updateDocs(dto: UpdateMecanicoDocsData): Promise<Empleado> {
    if (!dto.id) {
      throw new Error("El ID del empleado es requerido");
    }
    const empleadoId = dto.id;

    const processDoc = async (
      path: string | null | undefined,
      fkField:
        | "empleadoLicenciaConducirId"
        | "empleadoLicenciaDorsoId"
        | "empleadoInscripcionMonotributoId"
        | "empleadoRecategorizacionMonotributoId"
        | "empleadoCurriculumId"
        | "empleadoCredencialPagoId"
        | "empleadoDniFrenteId"
        | "empleadoDniDorsoId"
    ) => {
      const hasPath = path != null && path !== "";
      const existing = await prisma.customFile.findFirst({
        where: { [fkField]: empleadoId },
        select: { id: true, tempPath: true, finalPath: true },
      });

      // Si no hay cambios (el path recibido es igual al path actual), no hacemos nada
      const currentPath =
        existing != null
          ? existing.finalPath ?? existing.tempPath
          : null;
      if (hasPath && currentPath === path) {
        return;
      }

      if (hasPath) {
        if (existing) {
          await prisma.customFile.update({
            where: { id: existing.id },
            data: {
              [fkField]: null,
              status: EstadoArchivo.ListoParaBorrar,
            },
          });
        }
        assertTempPathInTmp(path!);
        await prisma.customFile.create({
          data: {
            tempPath: path,
            [fkField]: empleadoId,
          },
        });
      } else if (existing) {
        await prisma.customFile.update({
          where: { id: existing.id },
          data: {
            [fkField]: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
    };

    await processDoc(dto.licenciaConducirPath, "empleadoLicenciaConducirId");
    await processDoc(dto.licenciaDorsoPath, "empleadoLicenciaDorsoId");
    await processDoc(
      dto.inscripcionMonotributoPath,
      "empleadoInscripcionMonotributoId"
    );
    await processDoc(
      dto.recategorizacionMonotributoPath,
      "empleadoRecategorizacionMonotributoId"
    );
    await processDoc(dto.curriculumPath, "empleadoCurriculumId");
    await processDoc(dto.credencialPagoPath, "empleadoCredencialPagoId");
    await processDoc(dto.dniFrentePath, "empleadoDniFrenteId");
    await processDoc(dto.dniDorsoPath, "empleadoDniDorsoId");

    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      include: {
        licenciaConducirPath: true,
        licenciaDorsoPath: true,
        inscripcionMonotributoPath: true,
        recategorizacionMonotributoPath: true,
        curriculumPath: true,
        credencialPagoPath: true,
        dniFrentePath: true,
        dniDorsoPath: true,
      },
    });
    if (!empleado) throw new Error("Empleado no encontrado");
    return empleado as Empleado;
  }
}
