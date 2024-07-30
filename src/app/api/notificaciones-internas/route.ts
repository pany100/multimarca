import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const leidas = searchParams.get("leidas");

    const skip = page * size;

    const where =
      leidas === null
        ? {}
        : leidas === "true"
        ? { leida: true }
        : leidas === "false"
        ? { leida: false }
        : {};

    const [notificaciones, total] = await Promise.all([
      prisma.notificacionInterna.findMany({
        where,
        skip,
        take: size,
        orderBy: { fecha: "desc" },
      }),
      prisma.notificacionInterna.count({ where }),
    ]);

    return NextResponse.json({
      items: notificaciones,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener notificaciones internas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
