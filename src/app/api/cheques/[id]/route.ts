import prisma from "@/lib/prisma";
import { OperacionCheque } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const cheque = await prisma.cheque.findUnique({
      where: { id },
    });

    if (!cheque) {
      return NextResponse.json(
        { error: "Cheque no encontrado" },
        { status: 404 }
      );
    }

    if (cheque.operacionCheque === OperacionCheque.VENTA) {
      const venta = await prisma.venta.findUnique({
        where: { id: cheque.operacionId },
        include: {
          cliente: true,
          items: {
            include: {
              stock: true,
            },
          },
        },
      });

      return NextResponse.json({
        ...cheque,
        entidad: venta,
      });
    }

    return NextResponse.json(cheque);
  } catch (error) {
    console.error("Error al obtener el cheque:", error);
    return NextResponse.json(
      { error: "Error al obtener el cheque" },
      { status: 500 }
    );
  }
}
