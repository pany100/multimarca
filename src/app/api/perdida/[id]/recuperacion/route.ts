import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

// GET all recuperaciones for a specific perdida
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const perdidaId = parseInt(params.id);

    // Validate the perdida exists
    const existePerdida = await prisma.perdidas.findUnique({
      where: { id: perdidaId },
    });

    if (!existePerdida) {
      return NextResponse.json(
        { error: "Registro de pérdida no encontrado" },
        { status: 404 }
      );
    }

    const recuperaciones = await prisma.recuperacion.findMany({
      where: { perdidaId },
      orderBy: { fecha: "desc" },
    });

    return NextResponse.json(recuperaciones);
  } catch (error) {
    console.error("Error al obtener las recuperaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST a new recuperacion for a specific perdida
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const perdidaId = parseInt(params.id);
    const body = await request.json();
    const { fecha, monto, detalle } = body;

    // Validate the perdida exists
    const existePerdida = await prisma.perdidas.findUnique({
      where: { id: perdidaId },
    });

    if (!existePerdida) {
      return NextResponse.json(
        { error: "Registro de pérdida no encontrado" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número mayor que cero" },
        { status: 400 }
      );
    }

    // Create the recuperacion
    const nuevaRecuperacion = await prisma.recuperacion.create({
      data: {
        fecha: fecha ? new Date(fecha) : new Date(),
        monto,
        detalle: detalle || null,
        perdidaId,
      },
    });

    return NextResponse.json(nuevaRecuperacion, { status: 201 });
  } catch (error) {
    console.error("Error al crear la recuperación:", error);
    return NextResponse.json(
      { error: "Error al crear la recuperación" },
      { status: 500 }
    );
  }
}
