import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get the URL from the request
    const url = new URL(request.url);
    // Get the 'tipo' parameter from the URL
    const tipo = url.searchParams.get("tipo");

    // Define the where clause based on the tipo parameter
    let whereClause = {};
    if (tipo === "ingreso") {
      whereClause = { esIngreso: true };
    } else if (tipo === "egreso") {
      whereClause = { esGasto: true };
    }

    const tiposOperacion = await prisma.tipoDeOperacion.findMany({
      where: whereClause,
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
      where: {
        label: body.label,
        esIngreso: body.esIngreso,
        esGasto: body.esGasto,
      },
    });

    if (existingTipo) {
      return NextResponse.json(
        { error: "Ya existe un tipo de operación con ese nombre" },
        { status: 409 }
      );
    }

    const newTipoOperacion = await prisma.tipoDeOperacion.create({
      data: {
        label: body.label,
        esIngreso: body.esIngreso,
        esGasto: body.esGasto,
      },
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
