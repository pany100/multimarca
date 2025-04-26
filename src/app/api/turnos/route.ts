import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const fecha = searchParams.get("fecha");
    const future = searchParams.get("future") === "true";

    const skip = page * size;

    // Get today's date at start of day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      OR: [
        { problema: { contains: query } },
        { auto: { patent: { contains: query } } },
        { auto: { owner: { fullName: { contains: query } } } },
      ],
      ...(fecha && { fecha: new Date(fecha) }),
      ...(future && {
        fecha: {
          gte: today,
        },
      }),
    };

    const [turnos, total] = await Promise.all([
      prisma.turno.findMany({
        where,
        include: {
          auto: {
            include: {
              owner: true,
            },
          },
        },
        skip,
        take: size,
        orderBy: [{ fecha: "asc" }, { hora: "asc" }],
      }),
      prisma.turno.count({ where }),
    ]);

    return NextResponse.json({
      items: turnos,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hora, fecha, problema, autoId } = body;

    if (!hora || !fecha || !problema || !autoId) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Check if date is in the past
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison
    const requestDate = new Date(fecha);
    requestDate.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison

    if (requestDate < currentDate) {
      return NextResponse.json(
        { error: "No se pueden crear turnos para fechas pasadas" },
        { status: 400 }
      );
    }

    const nuevoTurno = await prisma.turno.create({
      data: {
        hora: new Date(hora),
        fecha: new Date(fecha),
        problema,
        autoId,
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    });

    return NextResponse.json(nuevoTurno, { status: 201 });
  } catch (error) {
    console.error("Error al crear turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
