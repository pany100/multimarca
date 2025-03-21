import prisma from "@/lib/prisma";
import { deleteCheque, validateBeforeDelete } from "@/utils/chequeUtils";
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const isValidOperation = await validateBeforeDelete(id);
    if (!isValidOperation) {
      return NextResponse.json(
        { error: "El cheque tiene operaciones relacionadas" },
        { status: 400 }
      );
    }
    try {
      await deleteCheque(id);
    } catch (error) {
      console.error("Error al eliminar el cheque:", error);
      return NextResponse.json(
        { error: "Error al eliminar el cheque" },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Cheque eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el cheque:", error);
    return NextResponse.json(
      { error: "Error al eliminar el cheque" },
      { status: 500 }
    );
  }
}
