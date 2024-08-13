import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const plantilla = await prisma.plantillaPresupuesto.findUnique({
      where: { id },
      include: {
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

    if (!plantilla) {
      return NextResponse.json(
        { error: "Plantilla de presupuesto no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(plantilla);
  } catch (error) {
    console.error("Error al obtener plantilla de presupuesto:", error);
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
      nombre,
      manoDeObra,
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
    } = body;

    const repuestosToPersist = repuestosUsados.map((repuesto: any) => ({
      precioCompra: new Prisma.Decimal(repuesto.precioCompra),
      precioVenta: new Prisma.Decimal(repuesto.precioVenta),
      unidadesConsumidas: repuesto.unidadesConsumidas,
      stock: { connect: { id: repuesto.stock.id } },
    }));

    const reparacionesDeTerceroToPersist = reparacionesDeTercero.map(
      (reparacion: any) => ({
        nombre: reparacion.nombre,
        precioCompra: new Prisma.Decimal(reparacion.precioCompra),
        precioVenta: new Prisma.Decimal(reparacion.precioVenta),
        proveedor: { connect: { id: reparacion.proveedor.id } },
      })
    );

    const trabajosRealizadosToPersist = trabajosRealizados.map(
      (trabajo: any) => ({
        descripcion: trabajo.manoDeObra.name,
        precioUnitario: new Prisma.Decimal(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })
    );

    const plantillaActualizada = await prisma.plantillaPresupuesto.update({
      where: { id },
      data: {
        nombre,
        manoDeObra: new Prisma.Decimal(manoDeObra),
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
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
      },
    });

    return NextResponse.json(plantillaActualizada);
  } catch (error) {
    console.error("Error al actualizar plantilla de presupuesto:", error);
    return NextResponse.json(
      { error: "Error al actualizar plantilla de presupuesto" },
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

    await prisma.plantillaPresupuesto.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Plantilla eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar plantilla de presupuesto:", error);
    return NextResponse.json(
      { error: "Error al eliminar plantilla de presupuesto" },
      { status: 500 }
    );
  }
}
