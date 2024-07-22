import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const whereClause = {
      OR: [
        { description: { contains: query } },
        { whatsappKey: { contains: query } },
      ],
    };

    const [notificaciones, total] = await Promise.all([
      prisma.notificacionWhatsapp.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { date: "desc" },
      }),
      prisma.notificacionWhatsapp.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: notificaciones,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener notificaciones de WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, date, whatsappKey } = body;

    if (!description || !whatsappKey) {
      return NextResponse.json(
        { error: "Datos de notificación inválidos o faltantes" },
        { status: 400 }
      );
    }

    const nuevaNotificacion = await prisma.notificacionWhatsapp.create({
      data: {
        description,
        date,
        whatsappKey,
        processed: false,
      },
    });

    return NextResponse.json(nuevaNotificacion, { status: 201 });
  } catch (error) {
    console.error("Error al crear notificación de WhatsApp:", error);
    return NextResponse.json(
      { error: "No se pudo crear la notificación" },
      { status: 500 }
    );
  }
}
