import { ReparacionTerceroRepository } from "@/core/domain/repositories/reparacion-tercero.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import { EstadoArchivo } from "@prisma/client";

// Filtro para excluir archivos marcados para borrar
const VISIBLE_FILE_FILTER = {
  status: {
    notIn: [
      EstadoArchivo.ListoParaBorrar,
      EstadoArchivo.Borrado,
      EstadoArchivo.ErrorAlBorrar,
    ],
  },
};

export class PrismaReparacionTerceroRepository
  implements ReparacionTerceroRepository
{
  async add(
    data: {
      ordenReparacionId?: number;
      ventaId?: number;
      presupuestoId?: number;
      nombre: string;
      proveedorId: number;
      cantidad?: number;
      precioCompra: number;
      precioVenta: number;
      iva?: number | null;
      buyIva?: number | null;
      markup?: number | null;
      recibo?: string | null;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;

    // Create the reparacion tercero first
    const reparacion = await db.reparacionDeTercero.create({
      data: {
        ordenReparacionId: data.ordenReparacionId,
        ventaId: data.ventaId,
        presupuestoId: data.presupuestoId,
        nombre: data.nombre,
        proveedorId: data.proveedorId,
        cantidad: data.cantidad ?? 1,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        iva: data.iva,
        buyIva: data.buyIva,
        markup: data.markup,
        recibo: data.recibo,
      },
      include: {
        proveedor: true,
        reciboFile: { where: VISIBLE_FILE_FILTER },
      },
    });

    // If recibo is provided, create CustomFile (archivo en /tmp de S3, estado Pendiente)
    if (data.recibo) {
      assertTempPathInTmp(data.recibo);
      await db.customFile.create({
        data: {
          tempPath: data.recibo,
          reparacionDeTerceroId: reparacion.id,
        },
      });

      // Fetch the updated reparacion with the reciboFile relation
      return db.reparacionDeTercero.findUnique({
        where: { id: reparacion.id },
        include: {
          proveedor: true,
          reciboFile: { where: VISIBLE_FILE_FILTER },
        },
      });
    }

    return reparacion;
  }

  async update(
    id: number,
    data: {
      nombre?: string;
      proveedorId?: number;
      cantidad?: number;
      precioCompra?: number;
      precioVenta?: number;
      iva?: number | null;
      buyIva?: number | null;
      markup?: number | null;
      recibo?: string | null;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;
    const dataToUpdate: any = {};

    if (data.nombre !== undefined) dataToUpdate.nombre = data.nombre;
    if (data.proveedorId !== undefined)
      dataToUpdate.proveedorId = data.proveedorId;
    if (data.cantidad !== undefined) dataToUpdate.cantidad = data.cantidad;
    if (data.precioCompra !== undefined)
      dataToUpdate.precioCompra = data.precioCompra;
    if (data.precioVenta !== undefined)
      dataToUpdate.precioVenta = data.precioVenta;
    if (data.iva !== undefined) dataToUpdate.iva = data.iva;
    if (data.buyIva !== undefined) dataToUpdate.buyIva = data.buyIva;
    if (data.markup !== undefined) dataToUpdate.markup = data.markup;
    if (data.recibo !== undefined) dataToUpdate.recibo = data.recibo;

    // Get the current reparacion to compare recibo value
    const currentReparacion = await db.reparacionDeTercero.findUnique({
      where: { id },
      select: { recibo: true },
    });

    // Update the reparacion tercero
    const reparacion = await db.reparacionDeTercero.update({
      where: { id },
      data: dataToUpdate,
      include: {
        proveedor: true,
        reciboFile: { where: VISIBLE_FILE_FILTER },
      },
    });

    // Only handle CustomFile if recibo field is being updated AND is different from current value
    if (
      data.recibo !== undefined &&
      data.recibo !== currentReparacion?.recibo
    ) {
      // Check if there's an existing CustomFile
      const existingFile = await db.customFile.findUnique({
        where: { reparacionDeTerceroId: id },
      });

      if (data.recibo) {
        // If new recibo is provided, dereference old file and create new one
        if (existingFile) {
          // Dereference the old CustomFile (remove the relation) and mark for deletion
          await db.customFile.update({
            where: { id: existingFile.id },
            data: {
              reparacionDeTerceroId: null,
              status: EstadoArchivo.ListoParaBorrar,
            },
          });
        }

        // Create a new CustomFile for the new recibo (archivo en /tmp de S3, estado Pendiente)
        assertTempPathInTmp(data.recibo);
        await db.customFile.create({
          data: {
            tempPath: data.recibo,
            reparacionDeTerceroId: id,
          },
        });
      } else if (existingFile) {
        // If recibo is explicitly set to null, dereference the existing file and mark for deletion
        await db.customFile.update({
          where: { id: existingFile.id },
          data: {
            reparacionDeTerceroId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }

      // Fetch the updated reparacion with the reciboFile relation
      return db.reparacionDeTercero.findUnique({
        where: { id },
        include: {
          proveedor: true,
          reciboFile: { where: VISIBLE_FILE_FILTER },
        },
      });
    }

    // If recibo field is not being updated or is the same value, return the reparacion as is
    return reparacion;
  }

  async delete(id: number) {
    return prisma.reparacionDeTercero.delete({
      where: { id },
    });
  }
}
