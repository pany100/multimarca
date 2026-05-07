import { NotificationService } from "@/core/application/services/notification.service";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import prisma from "@/lib/prisma";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import {
  chequeQueryData,
  deleteCheque,
  getOperacionesByChequeId,
  mapChequeForResponse,
  validateBeforeDelete,
  validateChequeEditRequest,
} from "@/utils/chequeUtils";
import { EstadoArchivo, TipoNotificacionInterna } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const cheque = await prisma.cheque.findUnique({
      where: { id },
      include: { fotoFile: true },
    });

    if (!cheque) {
      return NextResponse.json(
        { error: "Cheque no encontrado" },
        { status: 404 }
      );
    }

    const { fotoFile, ...rest } = cheque;
    return NextResponse.json({
      ...rest,
      picturePath: fotoFile?.finalPath ?? fotoFile?.tempPath ?? null,
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

    if (!validateChequeEditRequest(body)) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para el cheque" },
        { status: 400 }
      );
    }

    const existingCheque = await prisma.cheque.findUnique({
      where: { id },
      include: { fotoFile: true },
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

    // El frontend envía siempre `picturePath` como string. Si la URL apunta a
    // /tmp/ Y NO coincide con la URL ya asociada al cheque, significa que el
    // usuario subió un archivo nuevo y debemos reemplazar el CustomFile.
    //
    // Importante chequear contra `tempPath` Y `finalPath` del fotoFile actual:
    // si el usuario abrió el form antes de que el cron promueva el archivo
    // (estaba en /tmp/), el form puede mandar la misma URL `tmp/<uuid>.pdf`
    // de vuelta. Sin este chequeo, desreferenciaríamos el archivo bueno y
    // crearíamos uno nuevo con el mismo path; si entremedio el cron promueve
    // el viejo a /cheques/, el cron también lo borrará al verlo
    // ListoParaBorrar — y el nuevo CustomFile termina apuntando a un archivo
    // que ya no existe en S3.
    const existingTempPath = existingCheque.fotoFile?.tempPath ?? null;
    const existingFinalPath = existingCheque.fotoFile?.finalPath ?? null;
    const matchesExisting =
      typeof picturePath === "string" &&
      (picturePath === existingTempPath || picturePath === existingFinalPath);
    const isReplacingPicture =
      typeof picturePath === "string" &&
      picturePath.includes("/tmp/") &&
      !matchesExisting;

    if (isReplacingPicture) {
      assertTempPathInTmp(picturePath);
      // Desreferenciar la foto vieja (si la había) y marcarla para borrado por
      // el cron. Después crear el CustomFile nuevo apuntando al cheque.
      if (existingCheque.fotoFile) {
        await prisma.customFile.update({
          where: { id: existingCheque.fotoFile.id },
          data: {
            chequeFotoId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
      await prisma.customFile.create({
        data: {
          tempPath: picturePath,
          status: EstadoArchivo.Pendiente,
          chequeFotoId: id,
        },
      });
    }

    const updatedCheque = await prisma.cheque.update({
      where: { id },
      data: {
        fechaCobro,
        fechaEmision,
        banco,
        owner,
        importe,
        numero,
        rechazado: isRechazado,
        fechaRechazo: isRechazado ? fechaRechazo : null,
        gastosAdministrativos: isRechazado ? gastosAdministrativos : null,
        observaciones: isRechazado ? observaciones : null,
      },
      select: chequeQueryData.select,
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

    return NextResponse.json(mapChequeForResponse(updatedCheque));
  } catch (error) {
    console.error("Error al actualizar el cheque:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cheque" },
      { status: 500 }
    );
  }
}
