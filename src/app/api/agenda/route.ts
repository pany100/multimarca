import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "50");
    const query = searchParams.get("query") || "";
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const onlyPending = searchParams.get("onlyPending") === "true";

    const skip = (page - 1) * size;

    // Build the where clause
    let where: any = {
      OR: [
        { titulo: { contains: query } },
        { descripcion: { contains: query } },
      ],
    };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of the month

      where.fecha = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filter only pending items if requested
    if (onlyPending) {
      where.hecho = false;
    }

    const [recordatorios, total] = await Promise.all([
      prisma.recordatorioAgenda.findMany({
        where,
        skip,
        take: size,
        orderBy: { fecha: "asc" },
      }),
      prisma.recordatorioAgenda.count({ where }),
    ]);

    return NextResponse.json({
      items: recordatorios,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener recordatorios de agenda:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, descripcion, fecha, hecho } = body;

    if (!titulo || !fecha) {
      return NextResponse.json(
        { error: "El título y la fecha son campos requeridos" },
        { status: 400 }
      );
    }

    // Validate fecha is a valid date
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return NextResponse.json(
        { error: "La fecha proporcionada no es válida" },
        { status: 400 }
      );
    }

    // Create the recordatorio
    const recordatorio = await prisma.recordatorioAgenda.create({
      data: {
        titulo,
        descripcion,
        fecha: fechaDate,
        hecho,
      },
    });

    return NextResponse.json(recordatorio, { status: 201 });
  } catch (error) {
    console.error("Error al crear recordatorio de agenda:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
