import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { ordenReparacionId, monto, fechaPago } = body;

    if (!ordenReparacionId || !monto) {
      return NextResponse.json(
        { error: "Datos de pago a mecánico inválidos o faltantes" },
        { status: 400 }
      );
    }

    const pagoActualizado = await prisma.pagoAMecanico.update({
      where: { id },
      data: {
        ordenReparacionId,
        monto,
        fechaPago: fechaPago ? new Date(fechaPago) : new Date(),
      },
      include: {
        ordenReparacion: {
          include: {
            auto: {
              include: {
                owner: true,
              },
            },
            mecanicos: {
              include: {
                mecanico: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(pagoActualizado);
  } catch (error) {
    console.error("Error al actualizar pago a mecánico:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pago a mecánico" },
      { status: 500 }
    );
  }
}
