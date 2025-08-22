import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const feriados = await prisma.feriado.findMany({
      where: {
        fecha: {
          gte: today,
        },
      },
      orderBy: {
        fecha: "asc",
      },
    });

    return NextResponse.json(feriados);
  } catch (error) {
    console.error("Error al obtener feriados futuros:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
