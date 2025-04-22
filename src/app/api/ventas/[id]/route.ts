import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import { moveFileInS3 } from "@/utils/s3Helper";
import { Prisma, TipoNotificacionInterna } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 }
      );
    }

    const venta = await prisma.venta.findUnique({
      where: { id },
      include: {
        cliente: true,
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
          },
        },
        trabajosRealizados: true,
      },
    });

    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(venta);
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    return NextResponse.json(
      { error: "Error al obtener la venta" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      clienteId,
      descripcionDescuento,
      descripcionIncremento,
      descuento,
      fecha,
      incremento,
      presupuesto,
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
    } = body;

    // Obtener la venta actual
    const ventaActual = await prisma.venta.findUnique({
      where: { id },
      include: {
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
      },
    });

    if (!ventaActual) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    if (!ventaActual.presupuesto && presupuesto) {
      return NextResponse.json(
        { error: "No se puede convertir una venta a presupuesto" },
        { status: 400 }
      );
    }

    // Verificar stock si no es un presupuesto
    if (!presupuesto) {
      for (const repuesto of repuestosUsados) {
        // Obtener la cantidad previa usada para este stock
        const repuestoExistente = ventaActual.repuestosUsados.find(
          (r) => r.stockId === repuesto.stock.id
        );
        const cantidadPrevia = repuestoExistente
          ? repuestoExistente.unidadesConsumidas
          : 0;
        const cantidadAdicional = repuesto.unidadesConsumidas - cantidadPrevia;

        if (cantidadAdicional > 0) {
          const stockActual = await prisma.stock.findUnique({
            where: { id: repuesto.stock.id },
            select: { units: true },
          });

          if (!stockActual || (stockActual.units ?? 0) < cantidadAdicional) {
            return NextResponse.json(
              {
                error: `Stock insuficiente para el repuesto ${repuesto.stock.name} con ID ${repuesto.stock.id}`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Preparar los datos para la actualización
    const repuestosToPersist = repuestosUsados.map((repuesto: any) => ({
      precioCompra: repuesto.precioCompra
        ? new Prisma.Decimal(repuesto.precioCompra)
        : new Prisma.Decimal(0),
      precioVenta: repuesto.precioVenta
        ? new Prisma.Decimal(repuesto.precioVenta)
        : new Prisma.Decimal(0),
      unidadesConsumidas: repuesto.unidadesConsumidas,
      stock: { connect: { id: repuesto.stock.id } },
    }));

    // Obtener todas las reparaciones existentes para comparar
    const reparacionesExistentes = await prisma.reparacionDeTercero.findMany({
      where: {
        ventaId: id,
      },
    });

    const reparacionesDeTerceroToPersist = await Promise.all(
      reparacionesDeTercero.map(async (reparacion: any) => {
        let reciboUrl = reparacion.recibo;
        if (reparacion.recibo && reparacion.recibo.includes("/tmp/")) {
          reciboUrl = await moveFileInS3(reparacion.recibo, "recibos");
        }
        return {
          nombre: reparacion.nombre,
          precioCompra: reparacion.precioCompra
            ? new Prisma.Decimal(reparacion.precioCompra)
            : new Prisma.Decimal(0),
          precioVenta: reparacion.precioVenta
            ? new Prisma.Decimal(reparacion.precioVenta)
            : new Prisma.Decimal(0),
          proveedor: { connect: { id: reparacion.proveedor.id } },
          recibo: reciboUrl,
        };
      })
    );

    const trabajosRealizadosToPersist = trabajosRealizados.map(
      (trabajo: any) => ({
        descripcion: trabajo.manoDeObra.name,
        precioUnitario: new Prisma.Decimal(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })
    );

    const dolar = await prisma.dolar.findFirst({
      where: {
        fecha: {
          lte: new Date(fecha),
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    // Actualizar la venta y el stock en una transacción
    const ventaActualizada = await prisma.$transaction(async (prisma) => {
      // Primero, restaurar el stock de los repuestos usados anteriormente
      for (const repuestoUsado of ventaActual.repuestosUsados) {
        await prisma.stock.update({
          where: { id: repuestoUsado.stockId },
          data: {
            units: {
              increment: repuestoUsado.unidadesConsumidas,
            },
          },
        });
      }

      // Actualizar la venta
      const venta = await prisma.venta.update({
        where: { id },
        data: {
          clienteId,
          fecha,
          dolarId: dolar?.id,
          presupuesto,
          descuento: new Prisma.Decimal(descuento),
          descripcionDescuento,
          incremento: new Prisma.Decimal(incremento),
          descripcionIncremento,
          repuestosUsados: {
            deleteMany: {},
            create: repuestosToPersist,
          },
          reparacionesDeTercero: {
            deleteMany: {},
            create: reparacionesDeTerceroToPersist,
          },
          trabajosRealizados: {
            deleteMany: {},
            create: trabajosRealizadosToPersist,
          },
        },
        include: {
          cliente: true,
          repuestosUsados: {
            include: {
              stock: true,
            },
          },
          reparacionesDeTercero: {
            include: {
              proveedor: true,
            },
          },
          trabajosRealizados: true,
        },
      });

      // Actualizar el stock y crear notificaciones si es necesario
      if (!presupuesto) {
        for (const repuesto of repuestosUsados) {
          const stockActualizado = await prisma.stock.update({
            where: { id: repuesto.stock.id },
            data: { units: { decrement: repuesto.unidadesConsumidas } },
          });

          if (
            (stockActualizado.units ?? 0) <=
            (stockActualizado.restockValue ?? 0)
          ) {
            await prisma.notificacionInterna.create({
              data: {
                fecha: new Date(),
                titulo: `${stockActualizado.name} necesita reposición`,
                texto: `El elemento ${stockActualizado.name} quedó con ${stockActualizado.units} unidades. Necesita reponer stock.`,
                leida: false,
                tipo: TipoNotificacionInterna.REPOSICION_STOCK,
                stockId: stockActualizado.id,
              },
            });
            const io = getIO();
            if (io) {
              io.emit("newNotification");
            }
          }
        }
      }

      return venta;
    });

    return NextResponse.json(ventaActualizada);
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    return NextResponse.json(
      { error: `Error al actualizar la venta: ${error}` },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 }
      );
    }

    const ventaEliminada = await prisma.$transaction(async (prisma) => {
      // Obtener la venta con sus repuestos usados
      const venta = await prisma.venta.findUnique({
        where: { id },
        include: {
          repuestosUsados: {
            include: {
              stock: true,
            },
          },
          reparacionesDeTercero: true,
          trabajosRealizados: true,
        },
      });

      if (!venta) {
        throw new Error("Venta no encontrada");
      }

      // Restaurar el stock
      for (const repuesto of venta.repuestosUsados) {
        const stockActualizado = await prisma.stock.update({
          where: { id: repuesto.stockId },
          data: {
            units: {
              increment: repuesto.unidadesConsumidas,
            },
          },
        });

        if (
          (stockActualizado.units ?? 0) <= (stockActualizado.restockValue ?? 0)
        ) {
          await prisma.notificacionInterna.create({
            data: {
              fecha: new Date(),
              titulo: `${stockActualizado.name} necesita reposición`,
              texto: `El elemento ${stockActualizado.name} quedó con ${stockActualizado.units} unidades. Necesita reponer stock.`,
              leida: false,
              tipo: TipoNotificacionInterna.REPOSICION_STOCK,
              stockId: stockActualizado.id,
            },
          });
          const io = getIO();
          if (io) {
            io.emit("newNotification");
          }
        }
      }

      // Eliminar la venta
      return prisma.venta.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Venta eliminada correctamente",
      venta: ventaEliminada,
    });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    return NextResponse.json(
      { error: `Error al eliminar la venta: ${error}` },
      { status: 500 }
    );
  }
}
