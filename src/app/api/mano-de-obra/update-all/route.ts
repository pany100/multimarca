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

    const trabajosActualizados = await prisma.$executeRaw`
    UPDATE ManoDeObra
    SET sellPrice = 
      CASE 
        WHEN ROUND(sellPrice * ${factorAumento}, 2) % 1000 > 0 
        THEN CEILING(ROUND(sellPrice * ${factorAumento}, 2) / 1000) * 1000
        ELSE ROUND(sellPrice * ${factorAumento}, 2)
      END
  `;

    return NextResponse.json({
      mensaje: "Precios de mano de obra actualizados con éxito",
      trabajosActualizados: trabajosActualizados,
    });
  } catch (error) {
    console.error("Error al actualizar precios de mano de obra:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
