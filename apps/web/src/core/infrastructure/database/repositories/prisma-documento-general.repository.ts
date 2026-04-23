import { DocumentoGeneralRepository } from "@/core/domain/repositories/documento-general.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import {
  CreateDocumentoGeneralData,
  ListDocumentoGeneralQuery,
  UpdateDocumentoGeneralData,
} from "@/core/infrastructure/validation/schemas/documento-general.schema";
import { EstadoArchivo } from "@prisma/client";

export class PrismaDocumentoGeneralRepository
  implements DocumentoGeneralRepository
{
  async list(query: ListDocumentoGeneralQuery) {
    const { page, size, query: search } = query;
    const skip = page * size;
    const where = search
      ? { titulo: { contains: search } }
      : {};

    const [items, total] = await Promise.all([
      prisma.documentoGeneral.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: { archivo: true },
      }),
      prisma.documentoGeneral.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        archivo: item.archivo ?? null,
      })),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findById(id: number) {
    const doc = await prisma.documentoGeneral.findUnique({
      where: { id },
      include: { archivo: true },
    });
    if (!doc) return null;
    return {
      ...doc,
      archivo: doc.archivo ?? null,
    };
  }

  async create(data: CreateDocumentoGeneralData) {
    const documento = await prisma.documentoGeneral.create({
      data: { titulo: data.titulo },
    });

    if (data.archivoPath) {
      assertTempPathInTmp(data.archivoPath);
      await prisma.customFile.create({
        data: {
          tempPath: data.archivoPath,
          documentoGeneralId: documento.id,
        },
      });
    }

    return documento;
  }

  async update(data: UpdateDocumentoGeneralData) {
    const documento = await prisma.documentoGeneral.update({
      where: { id: data.id },
      data: {
        titulo: data.titulo ?? undefined,
      },
    });

    if (data.archivoPath !== undefined) {
      const existing = await prisma.customFile.findFirst({
        where: { documentoGeneralId: data.id },
        select: { id: true, tempPath: true, finalPath: true },
      });

      const currentPath = existing
        ? existing.finalPath ?? existing.tempPath
        : null;

      if (data.archivoPath && currentPath !== data.archivoPath) {
        if (existing) {
          await prisma.customFile.update({
            where: { id: existing.id },
            data: {
              documentoGeneralId: null,
              status: EstadoArchivo.ListoParaBorrar,
            },
          });
        }
        assertTempPathInTmp(data.archivoPath);
        await prisma.customFile.create({
          data: {
            tempPath: data.archivoPath,
            documentoGeneralId: documento.id,
          },
        });
      } else if (!data.archivoPath && existing) {
        await prisma.customFile.update({
          where: { id: existing.id },
          data: {
            documentoGeneralId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
    }

    return documento;
  }

  async delete(id: number) {
    const existing = await prisma.customFile.findFirst({
      where: { documentoGeneralId: id },
    });

    if (existing) {
      await prisma.customFile.update({
        where: { id: existing.id },
        data: {
          documentoGeneralId: null,
          status: EstadoArchivo.ListoParaBorrar,
        },
      });
    }

    return prisma.documentoGeneral.delete({
      where: { id },
    });
  }
}
