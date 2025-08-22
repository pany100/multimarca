import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cantidadNoLeidas = await prisma.notificacionInterna.count({
      where: { leida: false, OR: [{ userId: null }, { userId: user.id }] },
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
