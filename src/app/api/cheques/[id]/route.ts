import prisma from "@/lib/prisma";
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

    return NextResponse.json(cheque);
  } catch (error) {
    console.error("Error al obtener el cheque:", error);
    return NextResponse.json(
      { error: "Error al obtener el cheque" },
      { status: 500 }
    );
  }
}
