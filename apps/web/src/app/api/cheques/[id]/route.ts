import { NotificationService } from "@/core/application/services/notification.service";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import prisma from "@/lib/prisma";
import {
  chequeQueryData,
  deleteCheque,
  getOperacionesByChequeId,
  validateBeforeDelete,
  validateChequeEditRequest,
} from "@/utils/chequeUtils";
import { deleteFileFromS3, moveFileInS3 } from "@/utils/s3Helper";
import { TipoNotificacionInterna } from "@prisma/client";
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

    return NextResponse.json({
      ...cheque,
      rechazado: cheque.rechazado ? "Si" : "No",
    });
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
      fechaCobro,
      fechaEmision,
      importe,
      picturePath,
      numero,
      owner,
      rechazado,
      fechaRechazo,
      gastosAdministrativos,
      observaciones,
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
    const isRechazado = rechazado === "Si" ? true : false;
    if (isRechazado) {
      if (!fechaRechazo || gastosAdministrativos === null || !observaciones) {
        return NextResponse.json(
          { error: "Faltan datos requeridos para el rechazo" },
          { status: 400 }
        );
      }
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
        owner,
        importe,
        numero,
        rechazado: isRechazado,
        fechaRechazo: isRechazado ? fechaRechazo : null,
        gastosAdministrativos: isRechazado ? gastosAdministrativos : null,
        observaciones: isRechazado ? observaciones : null,
      },
      select: {
        ...chequeQueryData.select,
      },
    });
    if (existingCheque.rechazado === false && isRechazado) {
      const operaciones = await getOperacionesByChequeId(existingCheque.id);
      const operacionesLinks = operaciones.map((operacion) => {
        if (operacion.tipo === "INGRESO_MANUAL") {
          return `Ingreso Manual ID: ${operacion.idOperacion}`;
        }
        if (operacion.tipo === "INGRESO_REPARACION") {
          return `Ingreso por reparacion ID: ${operacion.idOperacion}`;
        }
        if (operacion.tipo === "EXTRACCION") {
          return `Extraccion ID: ${operacion.idOperacion}`;
        }
        if (operacion.tipo === "GASTO") {
          return `Gasto ID: ${operacion.idOperacion}`;
        }
        return `Venta ID: ${operacion.idOperacion}`;
      });
      const notificationService = new NotificationService(
        new PrismaNotificationRepository(),
      );
      await notificationService.create({
        fecha: new Date(),
        titulo: "Hay operaciones a revisar",
        texto: `El cheque ${
          existingCheque.numero
        } se ha rechazado. Debe revisar las siguientes operaciones: ${operacionesLinks.join(
          ", "
        )}`,
        leida: false,
        tipo: TipoNotificacionInterna.CHEQUE_RECHAZADO,
      });
    }

    return NextResponse.json(updatedCheque);
  } catch (error) {
    console.error("Error al actualizar el cheque:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cheque" },
      { status: 500 }
    );
  }
}
