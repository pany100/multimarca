import { CertificadoEstudioRepository } from "@/core/domain/repositories/certificado-estudio.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateCertificadoEstudioData,
  ListCertificadoEstudioQuery,
  UpdateCertificadoEstudioData,
} from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";

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
    });
  }

  create(data: CreateCertificadoEstudioData) {
    return prisma.certificadoEstudio.create({
      data: {
        empleadoId: data.empleadoId,
        nombre: data.nombre ?? undefined,
        ruta: data.ruta ?? undefined,
        fecha: data.fecha ?? undefined,
        descripcion: data.descripcion ?? undefined,
      },
    });
  }

  update(data: UpdateCertificadoEstudioData) {
    return prisma.certificadoEstudio.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre ?? undefined,
        ruta: data.ruta ?? undefined,
        fecha: data.fecha ?? undefined,
        descripcion: data.descripcion ?? undefined,
      },
    });
  }

  delete(id: number) {
    return prisma.certificadoEstudio.delete({
      where: { id },
    });
  }
}
