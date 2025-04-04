import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET() {
  try {
    // Fetch all stock items without pagination
    const stocks = await prisma.stock.findMany({
      orderBy: { name: "asc" },
      include: { proveedor: true },
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error("Error al obtener todos los items de stock:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
