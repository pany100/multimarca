import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { porcentajeAumento } = body;

    if (
      isNaN(porcentajeAumento) ||
      porcentajeAumento < 0 ||
      porcentajeAumento > 100
    ) {
      return NextResponse.json(
        { error: "El porcentaje de aumento debe ser un número entre 0 y 100" },
        { status: 400 }
      );
    }

    const factorAumento = 1 + porcentajeAumento / 100;

    const trabajosActualizados = await prisma.manoDeObra.updateMany({
      data: {
        sellPrice: {
          multiply: factorAumento,
        },
      },
    });

    return NextResponse.json({
      mensaje: "Precios de mano de obra actualizados con éxito",
      trabajosActualizados: trabajosActualizados.count,
    });
  } catch (error) {
    console.error("Error al actualizar precios de mano de obra:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
