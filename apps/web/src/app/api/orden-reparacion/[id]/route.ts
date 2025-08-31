import { OrdenReparacionService } from "@/core/application/services/orden-reparacion.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { DeleteOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/delete-orden.use-case";
import { GetOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/get-orden.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { PrismaPagoMecanicoRepository } from "@/core/infrastructure/database/repositories/prisma-pago-mecanico.repository";
import { DolarExchangeAdapter } from "@/core/infrastructure/external/dolar-exchange.adapter";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import { getOrdenQuerySchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { getIO } from "@/lib/socketio";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import getDolarForDate from "@/utils/dolar";
import { deleteFileFromS3, moveFileInS3 } from "@/utils/s3Helper";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  EstadoOrdenReparacion,
  Prisma,
  TipoNotificacionInterna,
} from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      {
        id: params.id,
      },
      getOrdenQuerySchema
    );
    const ordenReparacion = await new GetOrdenUseCase(
      new PrismaOrdenReparacionRepository()
    ).execute(dto.id);
    return NextResponse.json(ordenReparacion);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const formData = await request.formData();
    const body = JSON.parse(formData.get("data") as string);
    const {
      autoId,
      fechaEntradaReparacion,
      fechaSalidaReparacion,
      fechaCreacion,
      kilometros,
      observacionesCliente,
      observacionesOcultas,
      observacionesEntrada,
      observacionesSalida,
      revisadoPorId,
      estado,
      pdfPath,
      mecanicos = [],
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      controlesEnReparacion = [],
      recibos,
      detalleControles,
      descuento,
      descripcionDescuento,
      incremento,
      descripcionIncremento,
      incrementoInterno,
      porcentajeRecargo,
    } = body;

    // Obtener la orden de reparación actual
    const ordenActual = await prisma.ordenReparacion.findUnique({
      where: { id },
      include: {
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
      },
    });

    if (!ordenActual) {
      return NextResponse.json(
        { error: "Orden de reparación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si se puede cambiar el estado
    if (ordenActual.estado !== "Presupuestado" && estado === "Presupuestado") {
      return NextResponse.json(
        {
          error:
            "No se puede volver al estado Presupuestado una vez que la orden ha avanzado",
        },
        { status: 400 }
      );
    }

    // Verificar stock si se cambia de Presupuestado a otro estado
    if (ordenActual.estado === "Presupuestado" && estado !== "Presupuestado") {
      for (const repuesto of repuestosUsados) {
        const stockActual = await prisma.stock.findUnique({
          where: { id: repuesto.stock.id },
          select: { units: true },
        });

        if (
          !stockActual ||
          (stockActual.units ?? 0) < repuesto.unidadesConsumidas
        ) {
          return NextResponse.json(
            {
              error: `Stock insuficiente para el repuesto ${repuesto.stock.name} con ID ${repuesto.stock.id}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Validación adicional para el estado Terminado
    if (estado === EstadoOrdenReparacion.Terminado) {
      if (
        mecanicos.length === 0 ||
        !fechaEntradaReparacion ||
        !fechaSalidaReparacion ||
        (repuestosUsados.length === 0 &&
          reparacionesDeTercero.length === 0 &&
          trabajosRealizados.length === 0)
      ) {
        return NextResponse.json(
          {
            error:
              "Para finalizar la orden, se requieren mecánicos, fechas de entrada y salida, y al menos un trabajo realizado, reparación de tercero o repuesto usado.",
          },
          { status: 400 }
        );
      }
    }

    // Preparar los datos para la actualización
    const repuestosToPersist = repuestosUsados.map((repuesto: any) => ({
      precioCompra: repuesto.precioCompra
        ? new Prisma.Decimal(repuesto.precioCompra)
        : new Prisma.Decimal(0),
      precioVenta: repuesto.precioVenta
        ? new Prisma.Decimal(repuesto.precioVenta)
        : new Prisma.Decimal(0),
      unidadesConsumidas: repuesto.unidadesConsumidas,
      stock: { connect: { id: repuesto.stock.id } },
    }));

    // Obtener todas las reparaciones existentes para comparar
    const reparacionesExistentes = await prisma.reparacionDeTercero.findMany({
      where: {
        ordenReparacionId: id,
      },
    });

    const reparacionesEliminadas = reparacionesExistentes.filter(
      (reparacionExistente) =>
        !reparacionesDeTercero.some(
          (reparacion: any) =>
            reparacion.nombre === reparacionExistente.nombre &&
            reparacion.proveedor.id === reparacionExistente.proveedorId
        )
    );

    const reparacionesDeTerceroToPersist = await Promise.all(
      reparacionesDeTercero.map(async (reparacion: any) => {
        const reparacionExistente = await prisma.reparacionDeTercero.findFirst({
          where: {
            ordenReparacionId: id,
            nombre: reparacion.nombre,
            proveedorId: reparacion.proveedor.id,
          },
        });
        let reciboUrl = reparacion.recibo;
        if (reparacion.recibo && reparacion.recibo.includes("/tmp/")) {
          reciboUrl = await moveFileInS3(reparacion.recibo, "recibos");
        }
        if (
          reparacionExistente?.recibo &&
          reparacionExistente.recibo !== reciboUrl
        ) {
          await deleteFileFromS3(reparacionExistente.recibo);
        }
        return {
          nombre: reparacion.nombre,
          precioCompra: reparacion.precioCompra
            ? new Prisma.Decimal(reparacion.precioCompra)
            : new Prisma.Decimal(0),
          precioVenta: reparacion.precioVenta
            ? new Prisma.Decimal(reparacion.precioVenta)
            : new Prisma.Decimal(0),
          proveedor: { connect: { id: reparacion.proveedor.id } },
          recibo: reciboUrl,
        };
      })
    );

    const trabajosRealizadosToPersist = trabajosRealizados.map(
      (trabajo: any) => ({
        descripcion: trabajo.manoDeObra.name,
        precioUnitario: new Prisma.Decimal(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })
    );

    const mecanicosToPersist = mecanicos.map((mecanico: any) => ({
      mecanicoId: mecanico.id,
      detalle: mecanico.detalle,
    }));

    const pdfFile = formData.get("pdfPath") as File | null;
    let permanentUrl = pdfPath;
    if (pdfFile) {
      const fileName = pdfFile.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      if (!fileExtension || !["pdf"].includes(fileExtension)) {
        return NextResponse.json(
          { mensaje: "Tipo de archivo no permitido" },
          { status: 400 }
        );
      }

      const secureFileName = `${uuidv4()}.${fileExtension}`;
      const s3ObjectKey = `scanner/${secureFileName}`;

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3ObjectKey,
        Body: Buffer.from(await pdfFile.arrayBuffer()),
        ContentType: pdfFile.type,
      };

      const s3Client = new S3Client({
        region: process.env.AWS_DEFAULT_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const bucketName = process.env.AWS_S3_BUCKET_NAME!;
      const region = process.env.AWS_DEFAULT_REGION!;
      permanentUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3ObjectKey}`;
    }

    let recibosUrls: string[] = [];
    if (recibos?.length > 0) {
      recibosUrls = await Promise.all(
        recibos.map(async (recibo: string) => {
          if (recibo && recibo.includes("/tmp/")) {
            return await moveFileInS3(recibo, "recibos");
          }
          return recibo;
        })
      );
    }
    if (
      ordenActual.recibos &&
      Array.isArray(ordenActual.recibos) &&
      ordenActual.recibos.length > 0
    ) {
      const recibosToDelete = ordenActual.recibos.filter(
        (recibo) => !recibos.includes(recibo)
      );
      await Promise.all(
        recibosToDelete.map(async (recibo) => {
          await deleteFileFromS3(recibo as string);
        })
      );
    }

    const dolar = await getDolarForDate(fechaCreacion);
    // Actualizar la orden de reparación y el stock en una transacción
    const [ordenReparacionActualizada] = await prisma.$transaction(
      async (prisma) => {
        const ordenActualizada = await prisma.ordenReparacion.update({
          where: { id },
          data: {
            autoId: parseInt(autoId),
            fechaEntradaReparacion,
            fechaSalidaReparacion,
            fechaCreacion,
            kilometros,
            observacionesCliente,
            observacionesEntrada,
            observacionesOcultas,
            observacionesSalida,
            estado,
            recibos: recibosUrls,
            revisadoPorId,
            dolarId: dolar?.id,
            descuento: new Prisma.Decimal(descuento),
            porcentajeRecargo: new Prisma.Decimal(porcentajeRecargo),
            mecanicos: {
              deleteMany: {},
              create: mecanicosToPersist,
            },
            repuestosUsados: {
              deleteMany: {},
              create: repuestosToPersist,
            },
            reparacionesDeTercero: {
              deleteMany: {},
              create: reparacionesDeTerceroToPersist,
            },
            trabajosRealizados: {
              deleteMany: {},
              create: trabajosRealizadosToPersist,
            },
            controlesEnReparacion: {
              upsert: controlesEnReparacion.map((control: any) => ({
                where: { id: control.id },
                update: {
                  valor: control.valor,
                },
                create: {
                  controlMecanicoId: control.id,
                  valor: control.valor,
                },
              })),
            },
            detalleControles,
            descripcionDescuento,
            pdfPath: permanentUrl,
            incremento: new Prisma.Decimal(incremento),
            descripcionIncremento,
            incrementoInterno: new Prisma.Decimal(incrementoInterno),
          },
          include: {
            auto: {
              include: {
                owner: true,
              },
            },
            revisadoPor: true,
            mecanicos: true,
            repuestosUsados: true,
            reparacionesDeTercero: true,
            trabajosRealizados: true,
            controlesEnReparacion: true,
            pagos: true,
            ingresos: {
              include: {
                dolar: true,
              },
            },
          },
        });

        for (const repuestoUsado of ordenActual.repuestosUsados) {
          await prisma.stock.update({
            where: { id: repuestoUsado.stockId },
            data: {
              units: {
                increment: repuestoUsado.unidadesConsumidas,
              },
            },
          });
        }

        // Actualizar stock y crear notificaciones si es necesario
        for (const repuesto of repuestosUsados) {
          const stockActualizado = await prisma.stock.update({
            where: { id: repuesto.stock.id },
            data: { units: { decrement: repuesto.unidadesConsumidas } },
          });

          if (
            (stockActualizado.units ?? 0) <=
            (stockActualizado.restockValue ?? 0)
          ) {
            await prisma.notificacionInterna.create({
              data: {
                fecha: new Date(),
                titulo: `${stockActualizado.name} necesita reposición`,
                texto: `El elemento ${stockActualizado.name} quedó con ${stockActualizado.units} unidades. Necesita reponer stock.`,
                leida: false,
                tipo: TipoNotificacionInterna.REPOSICION_STOCK,
                stockId: stockActualizado.id,
              },
            });
            const io = getIO();
            if (io) {
              io.emit("newNotification");
            }
          }
        }

        return [ordenActualizada];
      }
    );

    if (estado === "Terminado") {
      const existePago = await prisma.pagoAMecanico.findFirst({
        where: {
          ordenReparacionId: id,
        },
      });

      if (!existePago) {
        await prisma.pagoAMecanico.create({
          data: {
            ordenReparacionId: id,
          },
        });
      }

      const existeNotificacion = await prisma.notificacionInterna.findFirst({
        where: {
          ordenReparacionId: id,
          tipo: TipoNotificacionInterna.REPARACION_TERMINADA,
        },
      });

      // Si existe un PDF previo y se está subiendo uno nuevo, eliminar el anterior de S3
      if (ordenActual?.pdfPath && ordenActual.pdfPath !== permanentUrl) {
        await deleteFileFromS3(ordenActual.pdfPath);
      }

      await Promise.all(
        reparacionesEliminadas.map(async (reparacion) => {
          if (reparacion.recibo) {
            await deleteFileFromS3(reparacion.recibo);
          }
        })
      );

      if (!existeNotificacion) {
        await prisma.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: "Reparación Terminada",
            texto: `La reparación del auto ${ordenReparacionActualizada.auto.brand} ${ordenReparacionActualizada.auto.patent} se encuentra terminada. Tiene que pagar la mano de obra correspondiente.`,
            leida: false,
            ordenReparacionId: id,
            tipo: TipoNotificacionInterna.REPARACION_TERMINADA,
          },
        });
        const io = getIO();
        if (io) {
          io.emit("newNotification");
        }
      }
    }

    return NextResponse.json(ordenReparacionActualizada);
  } catch (error) {
    console.error("Error al actualizar orden de reparación:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      {
        id: params.id,
      },
      getOrdenQuerySchema
    );
    const notificationRepo = new PrismaNotificationRepository();
    await new DeleteOrdenUseCase(
      new PrismaUnitOfWork(),
      new OrdenReparacionService(
        new StockManagerService(),
        new PrismaOrdenReparacionRepository(),
        new PrismaPagoMecanicoRepository(),
        notificationRepo,
        new PrismaInventoryAdapter(notificationRepo),
        new DolarExchangeAdapter(),
        new S3FileStorageAdapter()
      )
    ).execute(dto.id);

    return NextResponse.json({
      mensaje: "Orden de reparación eliminada y stock restaurado",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
