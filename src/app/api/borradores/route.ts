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

    const whereClause: any = {
      OR: [
        { auto: { patent: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
        { auto: { owner: { fullName: { contains: query } } } },
      ],
    };

    const [borradores, total] = await Promise.all([
      prisma.borrador.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { fechaCreacion: "desc" },
        include: {
          auto: {
            include: {
              owner: true,
            },
          },
          repuestosUsados: true,
          reparacionesDeTercero: true,
          trabajosRealizados: true,
        },
      }),
      prisma.borrador.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: borradores,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener borradores:", error);
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
      autoId,
      observacionesCliente,
      detallesDeTrabajo,
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      descuento,
      descripcionDescuento,
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
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })
    );

    const nuevoBorrador = await prisma.borrador.create({
      data: {
        autoId: parseInt(autoId),
        observacionesCliente,
        descripcionDescuento,
        detallesDeTrabajo,
        descuento: descuento
          ? new Prisma.Decimal(descuento)
          : new Prisma.Decimal(0),
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
        auto: {
          include: {
            owner: true,
          },
        },
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
      },
    });

    return NextResponse.json(nuevoBorrador, { status: 201 });
  } catch (error) {
    console.error("Error al crear borrador:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
