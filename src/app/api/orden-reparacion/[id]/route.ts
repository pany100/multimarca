import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ordenReparacion = await prisma.ordenReparacion.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: true,
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
        controlesEnReparacion: {
          include: {
            controlMecanico: true,
          },
        },
        pagos: true,
      },
    });

    if (!ordenReparacion) {
      return NextResponse.json(
        { error: "Orden de reparación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(ordenReparacion);
  } catch (error) {
    console.error("Error al obtener orden de reparación:", error);
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
      fechaEntradaReparacion,
      fechaSalidaReparacion,
      kilometros,
      observacionesCliente,
      observacionesEntrada,
      observacionesSalida,
      estado,
      pdfPath,
      mecanicosIds = [],
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      montoTotalCliente,
    } = body;

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

    const reparacionesDeTerceroToPersist = reparacionesDeTercero.map(
      (reparacion: any) => ({
        nombre: reparacion.nombre,
        precioCompra: reparacion.precioCompra
          ? new Prisma.Decimal(reparacion.precioCompra)
          : new Prisma.Decimal(0),
        precioVenta: reparacion.precioVenta
          ? new Prisma.Decimal(reparacion.precioVenta)
          : new Prisma.Decimal(0),
        proveedor: { connect: { id: reparacion.proveedor.id } },
      })
    );

    const trabajosRealizadosToPersist = trabajosRealizados.map(
      (trabajo: any) => ({
        descripcion: trabajo.manoDeObra.name,
        precioUnitario: new Prisma.Decimal(trabajo.precioUnitario),
      })
    );

    const ordenReparacionActualizada = await prisma.ordenReparacion.update({
      where: { id },
      data: {
        autoId: parseInt(autoId),
        fechaEntradaReparacion,
        fechaSalidaReparacion,
        kilometros,
        observacionesCliente,
        observacionesEntrada,
        observacionesSalida,
        estado,
        pdfPath,
        montoTotalCliente: new Prisma.Decimal(montoTotalCliente),
        mecanicos: {
          set: mecanicosIds.map((id: number) => ({ id })),
        },
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
        mecanicos: true,
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        controlesEnReparacion: true,
        pagos: true,
      },
    });

    return NextResponse.json(ordenReparacionActualizada);
  } catch (error) {
    console.error("Error al actualizar orden de reparación:", error);
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
    await prisma.ordenReparacion.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Orden de reparación eliminada" });
  } catch (error) {
    console.error("Error al eliminar orden de reparación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
