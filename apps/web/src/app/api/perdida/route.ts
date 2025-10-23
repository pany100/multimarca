import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const skip = page * size;

    // Build the where clause
    const where: any = {
      OR: [
        { id: { equals: parseInt(query) || undefined } },
        { descripcion: { contains: query } },
      ],
    };

    // Add date filter if provided
    if (fromDate || toDate) {
      where.fecha = {};

      if (fromDate) {
        where.fecha.gte = new Date(fromDate);
      }

      if (toDate) {
        // Set the end of the day for the 'to' date
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        where.fecha.lte = endDate;
      }
    }

    const [perdidas, total] = await Promise.all([
      prisma.perdidas.findMany({
        where,
        skip,
        take: size,
        orderBy: { fecha: "desc" },
        include: {
          dolar: true,
          recuperaciones: true,
        },
      }),
      prisma.perdidas.count({
        where,
      }),
    ]);

    return NextResponse.json({
      items: perdidas,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener perdidas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, monto, descripcion, moneda, cancelado, cotizacionDolar } =
      body;

    // Validate required fields
    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número mayor que cero" },
        { status: 400 }
      );
    }

    if (
      !descripcion ||
      typeof descripcion !== "string" ||
      descripcion.trim() === ""
    ) {
      return NextResponse.json(
        { error: "La descripción es requerida" },
        { status: 400 }
      );
    }

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

    // Create the new perdida record
    const nuevaPerdida = await prisma.perdidas.create({
      data: {
        fecha: fecha ? new Date(fecha) : new Date(),
        monto: monto,
        descripcion: descripcion.trim(),
        moneda: moneda || undefined,
        dolarId: dolar?.id || undefined,
        cotizacionDolar,
      },
      include: {
        dolar: true,
      },
    });

    return NextResponse.json(nuevaPerdida, { status: 201 });
  } catch (error) {
    console.error("Error al crear perdida:", error);
    return NextResponse.json(
      { error: "No se pudo crear el registro de pérdida" },
      { status: 500 }
    );
  }
}
