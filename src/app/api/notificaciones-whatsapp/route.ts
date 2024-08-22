import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const conversaciones = await prisma.conversacionWhatsApp.findMany({
      include: {
        cliente: true,
        mensajes: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
      orderBy: [
        {
          mensajes: {
            _count: "desc",
          },
        },
        {
          ultimoMensaje: "desc",
        },
      ],
    });

    // Ordenar las conversaciones basándose en mensajes no leídos
    const conversacionesOrdenadas = conversaciones.sort((a, b) => {
      const aTieneNoLeidos = a.mensajes.some((m) => !m.read);
      const bTieneNoLeidos = b.mensajes.some((m) => !m.read);

      if (aTieneNoLeidos && !bTieneNoLeidos) return -1;
      if (!aTieneNoLeidos && bTieneNoLeidos) return 1;
      return 0;
    });

    return NextResponse.json(conversacionesOrdenadas);
  } catch (error) {
    console.error("Error al obtener las conversaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
