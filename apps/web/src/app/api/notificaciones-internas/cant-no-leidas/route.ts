import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo contar no leídas del usuario logueado (mismo criterio que el listado)
    const cantidadNoLeidas = await prisma.notificacionInterna.count({
      where: { leida: false, userId: user.id },
    });

    return NextResponse.json({ cantidadNoLeidas });
  } catch (error) {
    console.error(
      "Error al obtener la cantidad de notificaciones no leídas:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
