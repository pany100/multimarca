import { RepuestoUsadoRepository } from "@/core/domain/repositories/repuesto-usado.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaRepuestoUsadoRepository implements RepuestoUsadoRepository {
  async add(
    data: {
      ordenReparacionId?: number;
      ventaId?: number;
      presupuestoId?: number;
      stockId: number;
      precioCompra: number;
      precioVenta: number;
      unidadesConsumidas: number;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;

    return db.repuestoUsado.create({
      data: {
        ordenReparacionId: data.ordenReparacionId,
        ventaId: data.ventaId,
        presupuestoId: data.presupuestoId,
        stockId: data.stockId,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        unidadesConsumidas: data.unidadesConsumidas,
      },
      include: {
        stock: true,
      },
    });
  }

  async update(
    id: number,
    data: {
      stockId?: number;
      precioCompra?: number;
      precioVenta?: number;
      unidadesConsumidas?: number;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;
    const dataToUpdate: any = {};

    if (data.stockId !== undefined) dataToUpdate.stockId = data.stockId;
    if (data.precioCompra !== undefined)
      dataToUpdate.precioCompra = data.precioCompra;
    if (data.precioVenta !== undefined)
      dataToUpdate.precioVenta = data.precioVenta;
    if (data.unidadesConsumidas !== undefined)
      dataToUpdate.unidadesConsumidas = data.unidadesConsumidas;

    return db.repuestoUsado.update({
      where: { id },
      data: dataToUpdate,
      include: {
        stock: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.repuestoUsado.delete({
      where: { id },
    });
  }
}
