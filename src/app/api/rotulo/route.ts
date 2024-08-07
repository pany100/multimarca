import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const rotulos = await prisma.stock.findMany({
      where: {
        label: {
          contains: query,
        },
      },
      select: {
        label: true,
      },
      distinct: ["label"],
      orderBy: { label: "asc" },
    });

    const items = rotulos.map((rotulo) => rotulo.label).filter(Boolean);

    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("Error al obtener rótulos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
