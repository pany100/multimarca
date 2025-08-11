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
    // Obtener parámetros de fecha
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const skip = page * size;

    // Build the where clause
    let where: any = {
      OR: [
        { auto: { brand: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
        { informacionAuto: { contains: query } },
        { informacionCliente: { contains: query } },
        { auto: { model: { contains: query } } },
        { auto: { patent: { contains: query } } },
        { auto: { owner: { fullName: { contains: query } } } },
        { observacionesCliente: { contains: query } },
        { administrativo: { fullName: { contains: query } } },
        { detallesDeTrabajo: { contains: query } },
      ],
    };

    // Filter by estado if provided
    if (estado) {
      where.estado = estado;
    }

    if (fromDate || toDate) {
      where.fecha = {};

      if (fromDate) {
        // Convertir YYYY-MM-DD a objeto Date
        where.fecha.gte = new Date(fromDate);
      }

      if (toDate) {
        // Convertir YYYY-MM-DD a objeto Date y establecer a final del día
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        where.fecha.lte = endDate;
      }
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
          creador: true,
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
          tareasAdministrativas: {
            include: {
              usuario: true,
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
      informacionAuto,
      informacionCliente,
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      tareasAdministrativas = [],
      descuento = 0,
      descripcionDescuento,
      incrementoInterno = 0,
      incremento = 0,
      descripcionIncremento,
      estado = EstadoPresupuestoType.EnPreparacion,
    } = body;

    if (!observacionesCliente) {
      return NextResponse.json(
        { error: "Las observaciones del cliente son obligatorios" },
        { status: 400 }
      );
    }

    // Validar que los arrays sean arrays
    if (
      !Array.isArray(repuestosUsados) ||
      !Array.isArray(reparacionesDeTercero) ||
      !Array.isArray(trabajosRealizados) ||
      !Array.isArray(tareasAdministrativas)
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
        informacionAuto,
        informacionCliente,
        estado,
        dolarId: dolar?.id,
        descuento: new Prisma.Decimal(descuento),
        descripcionDescuento,
        incrementoInterno: new Prisma.Decimal(incrementoInterno),
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
        tareasAdministrativas: {
          create: tareasAdministrativas,
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
