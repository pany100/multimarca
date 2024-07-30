import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET() {
  try {
    const cantidadNoLeidas = await prisma.notificacionInterna.count({
      where: { leida: false },
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
