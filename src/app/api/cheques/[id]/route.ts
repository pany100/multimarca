import prisma from "@/lib/prisma";
import {
  chequeQueryData,
  deleteCheque,
  validateBeforeDelete,
  validateChequeEditRequest,
} from "@/utils/chequeUtils";
import { deleteFileFromS3, moveFileInS3 } from "@/utils/s3Helper";
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      banco,
      emisor,
      fechaCobro,
      fechaEmision,
      importe,
      numeroCheque,
      picturePath,
    } = body;

    // Validate request data
    if (!validateChequeEditRequest(body)) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para el cheque" },
        { status: 400 }
      );
    }

    // Check if cheque exists
    const existingCheque = await prisma.cheque.findUnique({
      where: { id },
    });

    if (!existingCheque) {
      return NextResponse.json(
        { error: "Cheque no encontrado" },
        { status: 404 }
      );
    }

    // Handle picture path if needed
    let picturePathUrl = picturePath;
    if (picturePath && picturePath.includes("/tmp/")) {
      picturePathUrl = await moveFileInS3(picturePath, "cheques");
    }

    // Delete old picture if it's being replaced
    if (
      existingCheque.picturePath &&
      existingCheque.picturePath !== picturePathUrl &&
      picturePathUrl // Only delete if there's a new picture
    ) {
      await deleteFileFromS3(existingCheque.picturePath);
    }

    // Update cheque
    const updatedCheque = await prisma.cheque.update({
      where: { id },
      data: {
        fechaCobro,
        fechaEmision,
        picturePath: picturePathUrl || existingCheque.picturePath, // Keep old path if no new one
        banco,
        owner: emisor,
        importe,
        numero: numeroCheque,
      },
      select: {
        ...chequeQueryData.select,
      },
    });

    return NextResponse.json(updatedCheque);
  } catch (error) {
    console.error("Error al actualizar el cheque:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cheque" },
      { status: 500 }
    );
  }
}
