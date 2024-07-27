import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [extracciones, total] = await Promise.all([
      prisma.extraccion.findMany({
        where: {
          motivo: { contains: query },
        },
        skip,
        take: size,
        orderBy: { fecha: "desc" },
        include: {
          usuario: {
            select: {
              fullName: true,
            },
          },
        },
      }),
      prisma.extraccion.count({
        where: {
          motivo: { contains: query },
        },
      }),
    ]);

    return NextResponse.json({
      items: extracciones,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener extracciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monto, usuarioId, motivo, fecha, tipoExtraccion } = body;

    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "Monto de extracción inválido o faltante" },
        { status: 400 }
      );
    }

    if (!usuarioId || typeof usuarioId !== "number") {
      return NextResponse.json(
        { error: "ID de usuario inválido o faltante" },
        { status: 400 }
      );
    }

    if (!motivo || typeof motivo !== "string") {
      return NextResponse.json(
        { error: "Motivo de extracción inválido o faltante" },
        { status: 400 }
      );
    }

    if (
      !tipoExtraccion ||
      !["EFECTIVO", "TRANSFERENCIA"].includes(tipoExtraccion)
    ) {
      return NextResponse.json(
        { error: "Tipo de extracción inválido o faltante" },
        { status: 400 }
      );
    }

    const nuevaExtraccion = await prisma.extraccion.create({
      data: {
        monto,
        usuarioId,
        motivo,
        tipoExtraccion,
        fecha,
      },
      include: {
        usuario: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(nuevaExtraccion, { status: 201 });
  } catch (error) {
    console.error("Error al crear extracción:", error);
    return NextResponse.json(
      { error: "No se pudo crear la extracción" },
      { status: 500 }
    );
  }
}
