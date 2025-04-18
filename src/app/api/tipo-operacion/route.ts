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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.label || typeof body.label !== "string") {
      return NextResponse.json(
        { error: "El campo 'label' es requerido y debe ser un string" },
        { status: 400 }
      );
    }

    const existingTipo = await prisma.tipoDeOperacion.findUnique({
      where: { label: body.label },
    });

    if (existingTipo) {
      return NextResponse.json(
        { error: "Ya existe un tipo de operación con ese nombre" },
        { status: 409 }
      );
    }

    const newTipoOperacion = await prisma.tipoDeOperacion.create({
      data: { label: body.label },
    });

    return NextResponse.json(newTipoOperacion, { status: 201 });
  } catch (error) {
    console.error("Error creating tipo de operación:", error);
    return NextResponse.json(
      { error: "Error al crear tipo de operación" },
      { status: 500 }
    );
  }
}
