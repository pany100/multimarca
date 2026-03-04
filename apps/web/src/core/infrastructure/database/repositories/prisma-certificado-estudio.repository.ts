import { CertificadoEstudioRepository } from "@/core/domain/repositories/certificado-estudio.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateCertificadoEstudioData,
  ListCertificadoEstudioQuery,
  UpdateCertificadoEstudioData,
} from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";
import { EstadoArchivo } from "@prisma/client";

export class PrismaCertificadoEstudioRepository
  implements CertificadoEstudioRepository
{
  async list(query: ListCertificadoEstudioQuery) {
    const { page, size, empleadoId } = query;
    const skip = page * size;
    const where = empleadoId ? { empleadoId } : {};

    const [items, total] = await Promise.all([
      prisma.certificadoEstudio.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: "asc" },
        include: { ruta: true },
      }),
      prisma.certificadoEstudio.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  findById(id: number) {
    return prisma.certificadoEstudio.findUnique({
      where: { id },
      include: { ruta: true },
    });
  }

  async create(data: CreateCertificadoEstudioData) {
    const created = await prisma.certificadoEstudio.create({
      data: {
        empleadoId: data.empleadoId,
        nombre: data.nombre ?? undefined,
        fecha: data.fecha ?? undefined,
        descripcion: data.descripcion ?? undefined,
      },
    });
    if (data.ruta != null && data.ruta !== "") {
      await prisma.customFile.create({
        data: {
          tempPath: data.ruta,
          certificadoEstudioRutaId: created.id,
        },
      });
    }
    const found = await this.findById(created.id);
    if (!found) throw new Error("CertificadoEstudio no encontrado tras crear");
    return found;
  }

  async update(data: UpdateCertificadoEstudioData) {
    const id = data.id;
    const existingFile = await prisma.customFile.findFirst({
      where: { certificadoEstudioRutaId: id },
      select: { id: true },
    });
    const hasPath = data.ruta != null && data.ruta !== "";
    if (existingFile) {
      await prisma.customFile.update({
        where: { id: existingFile.id },
        data: {
          certificadoEstudioRutaId: null,
          status: EstadoArchivo.ListoParaBorrar,
        },
      });
    }
    if (hasPath) {
      await prisma.customFile.create({
        data: {
          tempPath: data.ruta!,
          certificadoEstudioRutaId: id,
        },
      });
    }
    await prisma.certificadoEstudio.update({
      where: { id },
      data: {
        nombre: data.nombre ?? undefined,
        fecha: data.fecha ?? undefined,
        descripcion: data.descripcion ?? undefined,
      },
    });
    const found = await this.findById(id);
    if (!found) throw new Error("CertificadoEstudio no encontrado tras actualizar");
    return found;
  }

  async delete(id: number) {
    const existingFile = await prisma.customFile.findFirst({
      where: { certificadoEstudioRutaId: id },
      select: { id: true },
    });
    if (existingFile) {
      await prisma.customFile.update({
        where: { id: existingFile.id },
        data: {
          certificadoEstudioRutaId: null,
          status: EstadoArchivo.ListoParaBorrar,
        },
      });
    }
    return prisma.certificadoEstudio.delete({
      where: { id },
    });
  }
}
