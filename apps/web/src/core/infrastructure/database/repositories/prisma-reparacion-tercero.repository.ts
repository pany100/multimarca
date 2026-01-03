import { ReparacionTerceroRepository } from "@/core/domain/repositories/reparacion-tercero.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaReparacionTerceroRepository
  implements ReparacionTerceroRepository
{
  async add(
    data: {
      ordenReparacionId: number;
      nombre: string;
      proveedorId: number;
      precioCompra: number;
      precioVenta: number;
      recibo?: string | null;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;

    // Create the reparacion tercero first
    const reparacion = await db.reparacionDeTercero.create({
      data: {
        ordenReparacionId: data.ordenReparacionId,
        nombre: data.nombre,
        proveedorId: data.proveedorId,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        recibo: data.recibo,
      },
      include: {
        proveedor: true,
        reciboFile: true,
      },
    });

    // If recibo is provided, create CustomFile
    if (data.recibo) {
      await db.customFile.create({
        data: {
          tempPath: data.recibo,
          finalPath: data.recibo,
          reparacionDeTerceroId: reparacion.id,
        },
      });

      // Fetch the updated reparacion with the reciboFile relation
      return db.reparacionDeTercero.findUnique({
        where: { id: reparacion.id },
        include: {
          proveedor: true,
          reciboFile: true,
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
      precioCompra?: number;
      precioVenta?: number;
      recibo?: string | null;
    },
    deps?: { tx?: any }
  ) {
    const db = deps?.tx ?? prisma;
    const dataToUpdate: any = {};

    if (data.nombre !== undefined) dataToUpdate.nombre = data.nombre;
    if (data.proveedorId !== undefined)
      dataToUpdate.proveedorId = data.proveedorId;
    if (data.precioCompra !== undefined)
      dataToUpdate.precioCompra = data.precioCompra;
    if (data.precioVenta !== undefined)
      dataToUpdate.precioVenta = data.precioVenta;
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
        reciboFile: true,
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
          // Dereference the old CustomFile (remove the relation)
          await db.customFile.update({
            where: { id: existingFile.id },
            data: {
              reparacionDeTerceroId: null,
            },
          });
        }

        // Create a new CustomFile for the new recibo
        await db.customFile.create({
          data: {
            tempPath: data.recibo,
            finalPath: data.recibo,
            reparacionDeTerceroId: id,
          },
        });
      } else if (existingFile) {
        // If recibo is explicitly set to null, dereference the existing file
        await db.customFile.update({
          where: { id: existingFile.id },
          data: {
            reparacionDeTerceroId: null,
          },
        });
      }

      // Fetch the updated reparacion with the reciboFile relation
      return db.reparacionDeTercero.findUnique({
        where: { id },
        include: {
          proveedor: true,
          reciboFile: true,
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
