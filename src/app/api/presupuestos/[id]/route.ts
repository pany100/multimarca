import prisma from "@/lib/prisma";
import getDolarForDate from "@/utils/dolar";
import { deleteFileFromS3, moveFileInS3 } from "@/utils/s3Helper";
import { EstadoPresupuesto, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        dolar: true,
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

    if (!presupuesto) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(presupuesto);
  } catch (error) {
    console.error("Error al obtener presupuesto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
      autoId,
      observacionesCliente,
      detallesDeTrabajo,
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      descuento = 0,
      descripcionDescuento,
      incremento = 0,
      descripcionIncremento,
      estado = EstadoPresupuesto.EnPreparacion,
      fechaEnvio,
      fechaRespuesta,
    } = body;

    // Verificar si existe el presupuesto
    const presupuestoExistente = await prisma.presupuesto.findUnique({
      where: { id },
      include: {
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
      },
    });

    if (!presupuestoExistente) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    // Validar que los arrays sean arrays
    if (
      !Array.isArray(repuestosUsados) ||
      !Array.isArray(reparacionesDeTercero) ||
      !Array.isArray(trabajosRealizados)
    ) {
      return NextResponse.json(
        { error: "Los repuestos, reparaciones y trabajos deben ser arrays" },
        { status: 400 }
      );
    }

    // Procesar repuestos
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
        presupuestoId: id,
      },
    });

    const reparacionesEliminadas = reparacionesExistentes.filter(
      (reparacionExistente) =>
        !reparacionesDeTercero.some(
          (reparacion: any) =>
            reparacion.nombre === reparacionExistente.nombre &&
            reparacion.proveedor.id === reparacionExistente.proveedorId
        )
    );

    // Procesar reparaciones de tercero
    const reparacionesDeTerceroToPersist = await Promise.all(
      reparacionesDeTercero.map(async (reparacion: any) => {
        const reparacionExistente = await prisma.reparacionDeTercero.findFirst({
          where: {
            presupuestoId: id,
            nombre: reparacion.nombre,
            proveedorId: reparacion.proveedor.id,
          },
        });

        let reciboUrl = reparacion.recibo;
        if (reparacion.recibo && reparacion.recibo.includes("/tmp/")) {
          reciboUrl = await moveFileInS3(reparacion.recibo, "recibos");
        }

        if (
          reparacionExistente?.recibo &&
          reparacionExistente.recibo !== reciboUrl
        ) {
          await deleteFileFromS3(reparacionExistente.recibo);
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

    // Procesar trabajos realizados
    const trabajosRealizadosToPersist = trabajosRealizados.map(
      (trabajo: any) => ({
        descripcion: trabajo.manoDeObra.name,
        precioUnitario: new Prisma.Decimal(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })
    );

    // Obtener el dólar actual si no existe
    const fechaActual = new Date();
    const dolar = await getDolarForDate(fechaActual);

    // Actualizar el presupuesto
    const presupuestoActualizado = await prisma.presupuesto.update({
      where: { id },
      data: {
        autoId: parseInt(autoId),
        observacionesCliente,
        detallesDeTrabajo,
        estado,
        dolarId: dolar?.id,
        descuento: new Prisma.Decimal(descuento),
        descripcionDescuento,
        incremento: new Prisma.Decimal(incremento),
        descripcionIncremento,
        fechaEnvio,
        fechaRespuesta,
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
        auto: {
          include: {
            owner: true,
          },
        },
        dolar: true,
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

    // Eliminar recibos de reparaciones eliminadas
    await Promise.all(
      reparacionesEliminadas.map(async (reparacion) => {
        if (reparacion.recibo) {
          await deleteFileFromS3(reparacion.recibo);
        }
      })
    );

    return NextResponse.json(presupuestoActualizado);
  } catch (error) {
    console.error("Error al actualizar presupuesto:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
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

    // Verificar si existe el presupuesto
    const presupuestoExistente = await prisma.presupuesto.findUnique({
      where: { id },
      include: {
        reparacionesDeTercero: true,
      },
    });

    if (!presupuestoExistente) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar los recibos de las reparaciones de tercero
    for (const reparacion of presupuestoExistente.reparacionesDeTercero) {
      if (reparacion.recibo) {
        await deleteFileFromS3(reparacion.recibo);
      }
    }

    // Proceder con la eliminación del presupuesto
    await prisma.presupuesto.delete({
      where: { id },
    });

    return NextResponse.json({
      mensaje: "Presupuesto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar presupuesto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
