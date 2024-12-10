import { sincronizarControles } from "@/utils/controlHelper";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [controles, total] = await Promise.all([
      prisma.controlMecanico.findMany({
        where: {
          name: { contains: query },
        },
        skip,
        take: size,
        orderBy: { name: "asc" },
      }),
      prisma.controlMecanico.count({
        where: {
          name: { contains: query },
        },
      }),
    ]);

    return NextResponse.json({
      items: controles,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener controles mecánicos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, pdfName, ordenEnPdf } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de control mecánico inválido o faltante" },
        { status: 400 }
      );
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Tipo de control mecánico inválido o faltante" },
        { status: 400 }
      );
    }

    const nuevoControl = await prisma.controlMecanico.create({
      data: {
        name,
        type,
        ordenEnPdf,
        pdfName,
      },
    });
    sincronizarControles();

    return NextResponse.json(nuevoControl, { status: 201 });
  } catch (error) {
    console.error("Error al crear control mecánico:", error);
    return NextResponse.json(
      { error: "No se pudo crear el control mecánico" },
      { status: 500 }
    );
  }
}
