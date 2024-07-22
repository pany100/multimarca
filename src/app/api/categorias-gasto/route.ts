import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [categoriasGasto, total] = await Promise.all([
      prisma.categoriaGasto.findMany({
        where: {
          nombre: { contains: query },
        },
        skip,
        take: size,
        orderBy: { nombre: "asc" },
      }),
      prisma.categoriaGasto.count({
        where: {
          nombre: { contains: query },
        },
      }),
    ]);

    return NextResponse.json({
      items: categoriasGasto,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener categorías de gasto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Nombre de categoría inválido o faltante" },
        { status: 400 }
      );
    }

    const nuevaCategoriaGasto = await prisma.categoriaGasto.create({
      data: {
        nombre,
      },
    });

    return NextResponse.json(nuevaCategoriaGasto, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría de gasto:", error);
    return NextResponse.json(
      { error: "No se pudo crear la categoría de gasto" },
      { status: 500 }
    );
  }
}
