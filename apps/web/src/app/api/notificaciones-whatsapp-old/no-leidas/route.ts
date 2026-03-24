import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cantidadNoLeidas = await prisma.mensajeWhatsApp.count({
      where: {
        read: false,
      },
    });

    return NextResponse.json({ cantidadNoLeidas });
  } catch (error) {
    console.error("Error al obtener la cantidad de mensajes no leídos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
