import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [cheques, total] = await Promise.all([
      prisma.cheque.findMany({
        where: {
          numero: { contains: query },
        },
        skip,
        take: size,
        orderBy: { fechaCobro: "asc" },
      }),
      prisma.cheque.count({
        where: {
          numero: { contains: query },
        },
      }),
    ]);

    return NextResponse.json({
      items: cheques,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener cheques:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
