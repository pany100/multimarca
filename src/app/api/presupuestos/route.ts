import prisma from "@/lib/prisma";
import getDolarForDate from "@/utils/dolar";
import { moveFileInS3 } from "@/utils/s3Helper";
import {
  EstadoPresupuesto as EstadoPresupuestoType,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const estado = searchParams.get("estado") as EstadoPresupuestoType | null;
    const sortBy = searchParams.get("sortBy") || "fecha";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = page * size;

    // Build the where clause
    let where: any = {
      OR: [
        { auto: { brand: { contains: query } } },
        { auto: { model: { contains: query } } },
        { auto: { patent: { contains: query } } },
        { auto: { owner: { fullName: { contains: query } } } },
        { observacionesCliente: { contains: query } },
        { administrativo: { fullName: { contains: query } } },
      ],
    };

    // Filter by estado if provided
    if (estado) {
      where.estado = estado;
    }

    // Build the orderBy object
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute the query
    const [presupuestos, total] = await Promise.all([
      prisma.presupuesto.findMany({
        where,
        skip,
        take: size,
        orderBy,
        include: {
          auto: {
            include: {
              owner: true,
            },
          },
          administrativo: true,
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
      }),
      prisma.presupuesto.count({ where }),
    ]);

    return NextResponse.json({
      items: presupuestos,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener presupuestos:", error);
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
      administrativoId,
      descuento = 0,
      descripcionDescuento,
      incremento = 0,
      descripcionIncremento,
      estado = EstadoPresupuestoType.EnPreparacion,
    } = body;

    if (!autoId || !observacionesCliente) {
      return NextResponse.json(
        { error: "El auto y las observaciones del cliente son obligatorios" },
        { status: 400 }
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

    // Procesar reparaciones de tercero
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

    // Procesar trabajos realizados
    const trabajosRealizadosToPersist = trabajosRealizados.map(
      (trabajo: any) => ({
        descripcion: trabajo.manoDeObra.name,
        precioUnitario: new Prisma.Decimal(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })
    );

    // Obtener el dólar actual
    const fechaActual = new Date();
    const dolar = await getDolarForDate(fechaActual);

    // Crear el presupuesto
    const nuevoPresupuesto = await prisma.presupuesto.create({
      data: {
        autoId: parseInt(autoId),
        fecha: fechaActual,
        observacionesCliente,
        detallesDeTrabajo,
        estado,
        administrativoId,
        dolarId: dolar?.id,
        descuento: new Prisma.Decimal(descuento),
        descripcionDescuento,
        incremento: new Prisma.Decimal(incremento),
        descripcionIncremento,
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

    return NextResponse.json(nuevoPresupuesto, { status: 201 });
  } catch (error) {
    console.error("Error al crear presupuesto:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
