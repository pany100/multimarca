import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const whereClause: Prisma.PlantillaPresupuestoWhereInput = {
      OR: [
        { nombre: { contains: query } },
        { id: { equals: parseInt(query) || undefined } },
      ],
    };

    const [plantillasPresupuesto, total] = await Promise.all([
      prisma.plantillaPresupuesto.findMany({
        where: whereClause,
        skip,
        take: size,
        include: {
          repuestosUsados: true,
          reparacionesDeTercero: true,
          trabajosRealizados: true,
        },
      }),
      prisma.plantillaPresupuesto.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: plantillasPresupuesto,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener plantillas de presupuesto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      manoDeObra,
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

    const nuevaPlantillaPresupuesto = await prisma.plantillaPresupuesto.create({
      data: {
        nombre,
        manoDeObra: new Prisma.Decimal(manoDeObra),
        repuestosUsados: {
          create: repuestosToPersist,
        },
        reparacionesDeTercero: {
          create: reparacionesDeTerceroToPersist,
        },
        trabajosRealizados: {
          create: trabajosRealizadosToPersist,
        },
      },
      include: {
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
      },
    });

    return NextResponse.json(nuevaPlantillaPresupuesto, { status: 201 });
  } catch (error) {
    console.error("Error al crear plantilla de presupuesto:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
      console.error("Prisma error message:", error.message);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
