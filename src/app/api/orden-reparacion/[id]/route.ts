import { getIO } from "@/lib/socketio";
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
    const id = parseInt(params.id);
    const ordenReparacion = await prisma.ordenReparacion.findUnique({
      where: { id },
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
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
          },
        },
        trabajosRealizados: true,
        controlesEnReparacion: {
          include: {
            controlMecanico: true,
          },
        },
        pagos: true,
      },
    });

    if (!ordenReparacion) {
      return NextResponse.json(
        { error: "Orden de reparación no encontrada" },
        { status: 404 }
      );
    }
    const { mecanicos, ...ordenReparacionWithoutMecanicos } = ordenReparacion;
    const mecanicosWithoutMecanico = mecanicos.map(
      (el: { mecanico: { id: number; name: string } }) => ({
        id: el.mecanico.id,
        name: el.mecanico.name,
      })
    );

    return NextResponse.json({
      ...ordenReparacionWithoutMecanicos,
      mecanicos: mecanicosWithoutMecanico,
    });
  } catch (error) {
    console.error("Error al obtener orden de reparación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
    const formData = await request.formData();
    const body = JSON.parse(formData.get("data") as string);
    const {
      autoId,
      fechaEntradaReparacion,
      fechaSalidaReparacion,
      kilometros,
      observacionesCliente,
      observacionesEntrada,
      observacionesSalida,
      estado,
      pdfPath,
      mecanicos = [],
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      controlesEnReparacion = [],
      manoDeObra,
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

    const reparacionesDeTerceroToPersist = reparacionesDeTercero.map(
      (reparacion: any) => ({
        nombre: reparacion.nombre,
        precioCompra: reparacion.precioCompra
          ? new Prisma.Decimal(reparacion.precioCompra)
          : new Prisma.Decimal(0),
        precioVenta: reparacion.precioVenta
          ? new Prisma.Decimal(reparacion.precioVenta)
          : new Prisma.Decimal(0),
        proveedor: { connect: { id: reparacion.proveedor.id } },
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

    // Actualizar la orden de reparación y el stock en una transacción
    const [ordenReparacionActualizada] = await prisma.$transaction(
      async (prisma) => {
        const ordenActualizada = await prisma.ordenReparacion.update({
          where: { id },
          data: {
            autoId: parseInt(autoId),
            fechaEntradaReparacion,
            fechaSalidaReparacion,
            kilometros,
            observacionesCliente,
            observacionesEntrada,
            observacionesSalida,
            estado,
            manoDeObra: new Prisma.Decimal(manoDeObra),
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
            pdfPath: permanentUrl,
          },
          include: {
            auto: {
              include: {
                owner: true,
              },
            },
            mecanicos: true,
            repuestosUsados: true,
            reparacionesDeTercero: true,
            trabajosRealizados: true,
            controlesEnReparacion: true,
            pagos: true,
          },
        });

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
    const id = parseInt(params.id);

    // Verificar si existe la orden de reparación
    const ordenExistente = await prisma.ordenReparacion.findUnique({
      where: { id },
      include: {
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
      },
    });

    if (!ordenExistente) {
      return NextResponse.json(
        { error: "Orden de reparación no encontrada" },
        { status: 404 }
      );
    }

    // Restaurar las unidades de stock de repuestos usados
    for (const repuestoUsado of ordenExistente.repuestosUsados) {
      const stockFinal = await prisma.stock.findUnique({
        where: { id: repuestoUsado.stockId },
      });
      await prisma.stock.update({
        where: { id: repuestoUsado.stockId },
        data: {
          units: {
            increment: repuestoUsado.unidadesConsumidas,
          },
        },
      });
    }

    // Proceder con la eliminación de la orden
    await prisma.ordenReparacion.delete({
      where: { id },
    });

    return NextResponse.json({
      mensaje: "Orden de reparación eliminada y stock restaurado",
    });
  } catch (error) {
    console.error("Error al eliminar orden de reparación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
