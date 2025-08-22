import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [feriados, total] = await Promise.all([
      prisma.feriado.findMany({
        where: {
          OR: [
            { descripcion: { contains: query } },
            { fecha: query ? new Date(query) : undefined },
          ],
        },
        skip,
        take: size,
        orderBy: { fecha: "asc" },
      }),
      prisma.feriado.count({
        where: {
          OR: [
            { descripcion: { contains: query } },
            { fecha: query ? new Date(query) : undefined },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      items: feriados,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener feriados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, descripcion } = body;

    if (!fecha || !descripcion) {
      return NextResponse.json(
        { error: "Fecha y descripción son requeridos" },
        { status: 400 }
      );
    }

    // Check if the date is in the past
    const feriadoDate = new Date(fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (feriadoDate < today) {
      return NextResponse.json(
        { error: "No se puede crear un feriado para una fecha pasada" },
        { status: 400 }
      );
    }

    const nuevoFeriado = await prisma.feriado.create({
      data: {
        fecha: feriadoDate,
        descripcion,
      },
    });

    return NextResponse.json(nuevoFeriado, { status: 201 });
  } catch (error) {
    console.error("Error al crear feriado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
