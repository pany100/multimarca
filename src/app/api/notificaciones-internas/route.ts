import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import { getCurrentUser } from "src/utils/authFetch";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const leidas = searchParams.get("leidas");
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const skip = page * size;

    const where = {
      AND: [
        leidas === null
          ? {}
          : leidas === "true"
          ? { leida: true }
          : leidas === "false"
          ? { leida: false }
          : {},
        {
          OR: [{ userId: null }, { userId: user.id }],
        },
      ],
    };

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
