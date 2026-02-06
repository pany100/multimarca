import { TrabajoRealizadoRepository } from "@/core/domain/repositories/trabajo-realizado.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaTrabajoRealizadoRepository
  implements TrabajoRealizadoRepository
{
  async add(
    data: {
      ordenReparacionId?: number;
      ventaId?: number;
      presupuestoId?: number;
      precioUnitario: number;
      descripcion: string;
      diasParaRecordatorio?: number[] | null;
      pdfName?: string | null;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;

    return db.trabajoRealizado.create({
      data: {
        ordenReparacionId: data.ordenReparacionId,
        ventaId: data.ventaId,
        presupuestoId: data.presupuestoId,
        precioUnitario: data.precioUnitario,
        descripcion: data.descripcion,
        diasParaRecordatorio: data.diasParaRecordatorio ?? undefined,
        pdfName: data.pdfName ?? undefined,
      },
    });
  }

  async update(
    id: number,
    data: {
      precioUnitario?: number;
      descripcion?: string;
      diasParaRecordatorio?: number[] | null;
      pdfName?: string | null;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;
    const dataToUpdate: any = {};

    if (data.precioUnitario !== undefined)
      dataToUpdate.precioUnitario = data.precioUnitario;
    if (data.descripcion !== undefined)
      dataToUpdate.descripcion = data.descripcion;
    if (data.diasParaRecordatorio !== undefined)
      dataToUpdate.diasParaRecordatorio = data.diasParaRecordatorio;
    if (data.pdfName !== undefined)
      dataToUpdate.pdfName = data.pdfName;

    return db.trabajoRealizado.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async delete(id: number) {
    return prisma.trabajoRealizado.delete({
      where: { id },
    });
  }
}
