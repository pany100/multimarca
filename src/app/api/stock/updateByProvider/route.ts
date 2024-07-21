import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { proveedorId, porcentajeAumento } = await request.json();

    if (!proveedorId || !porcentajeAumento) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const factorAumento = 1 + porcentajeAumento / 100;

    await prisma.stock.updateMany({
      where: { proveedorId: parseInt(proveedorId) },
      data: {
        buyPrice: {
          multiply: factorAumento,
        },
      },
    });

    return NextResponse.json(
      { message: "Precios actualizados con éxito" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar precios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
