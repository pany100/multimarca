import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET() {
  try {
    const tiposOperacion = await prisma.tipoDeOperacion.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(tiposOperacion);
  } catch (error) {
    console.error("Error fetching tipos de operación:", error);
    return NextResponse.json(
      { error: "Error al obtener tipos de operación" },
      { status: 500 }
    );
  }
}
