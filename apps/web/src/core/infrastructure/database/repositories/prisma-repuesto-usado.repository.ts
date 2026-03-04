import { RepuestoUsadoRepository } from "@/core/domain/repositories/repuesto-usado.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaRepuestoUsadoRepository implements RepuestoUsadoRepository {
  async findById(id: number) {
    return prisma.repuestoUsado.findUnique({
      where: { id },
      include: {
        stock: true,
      },
    });
  }

  async add(
    data: {
      ordenReparacionId?: number;
      ventaId?: number;
      presupuestoId?: number;
      stockId: number;
      precioCompra: number;
      precioVenta: number;
      unidadesConsumidas: number;
      ocultoParaCliente?: boolean;
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
        ocultoParaCliente: data.ocultoParaCliente ?? false,
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
      ocultoParaCliente?: boolean;
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
    if (data.ocultoParaCliente !== undefined)
      dataToUpdate.ocultoParaCliente = data.ocultoParaCliente;

    return db.repuestoUsado.update({
      where: { id },
      data: dataToUpdate,
      include: {
        stock: true,
      },
    });
  }

  async delete(id: number, deps?: { tx?: any }) {
    const db = deps?.tx ?? prisma;
    return db.repuestoUsado.delete({
      where: { id },
    });
  }
}
