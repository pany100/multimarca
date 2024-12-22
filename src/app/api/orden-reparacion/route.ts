import { getIO } from "@/lib/socketio";
import getDolarForDate from "@/utils/dolar";
import { moveFileInS3 } from "@/utils/s3Helper";
import {
  EstadoOrdenReparacion,
  Prisma,
  TipoNotificacionInterna,
} from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const estado = searchParams.get("estado");

    const skip = page * size;

    const whereClause: any = {
      OR: [
        { auto: { patent: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
        { auto: { owner: { fullName: { contains: query } } } },
      ],
    };

    if (estado) {
      whereClause.estado = estado;
    }

    const [ordenesReparacion, total] = await Promise.all([
      prisma.ordenReparacion.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { fechaCreacion: "desc" },
        include: {
          auto: {
            include: {
              owner: true,
            },
          },
          mecanicos: true,
          controlesEnReparacion: {
            include: {
              controlMecanico: true,
            },
          },
          repuestosUsados: true,
          reparacionesDeTercero: true,
          trabajosRealizados: true,
          ingresos: {
            include: {
              dolar: true,
            },
          },
        },
      }),
      prisma.ordenReparacion.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: ordenesReparacion,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener órdenes de reparación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      autoId,
      fechaEntradaReparacion,
      fechaSalidaReparacion,
      fechaCreacion,
      kilometros,
      observacionesCliente,
      observacionesEntrada = "[]",
      observacionesSalida = "[]",
      estado = EstadoOrdenReparacion.Presupuestado,
      pdfPath,
      mecanicos = [],
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      manoDeObra,
      descuento,
      descripcionDescuento,
    } = body;

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

    if (estado !== EstadoOrdenReparacion.Presupuestado) {
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
    if (!Array.isArray(repuestosUsados)) {
      console.error("repuestosUsados no es un array:", repuestosUsados);
      console.log("repuestosUsados:", JSON.stringify(repuestosUsados, null, 2));
      return NextResponse.json(
        { error: "repuestosUsados debe ser un array" },
        { status: 400 }
      );
    }
    const repuestosToPersist = repuestosUsados.map((repuesto) => ({
      precioCompra: repuesto.precioCompra
        ? new Prisma.Decimal(repuesto.precioCompra)
        : new Prisma.Decimal(0),
      precioVenta: repuesto.precioVenta
        ? new Prisma.Decimal(repuesto.precioVenta)
        : new Prisma.Decimal(0),
      unidadesConsumidas: repuesto.unidadesConsumidas,
      stock: { connect: { id: repuesto.stock.id } },
    }));

    const reparacionesDeTerceroToPersist = await Promise.all(
      reparacionesDeTercero.map(async (reparacion: any) => {
        let reciboUrl = reparacion.recibo;
        if (reparacion.recibo && reparacion.recibo.includes("/tmp/")) {
          reciboUrl = await moveFileInS3(reparacion.recibo, "recibos");
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

    // Obtener todos los controles mecánicos existentes
    const controlesMecanicos = await prisma.controlMecanico.findMany();

    // Crear los controles en reparación para cada control mecánico
    const controlesEnReparacionToPersist = controlesMecanicos.map(
      (control) => ({
        controlMecanicoId: control.id,
        valor: control.type === "checkbox" ? "false" : "",
      })
    );

    const mecanicosToPersist = mecanicos.map((mecanico: any) => ({
      mecanicoId: mecanico.id,
    }));

    const fechaCreacionDate = fechaCreacion
      ? new Date(fechaCreacion)
      : new Date();
    const dolar = await getDolarForDate(fechaCreacionDate);

    const [nuevaOrdenReparacion] = await prisma.$transaction(async (prisma) => {
      const ordenCreada = await prisma.ordenReparacion.create({
        data: {
          autoId: parseInt(autoId),
          fechaCreacion: fechaCreacionDate,
          fechaEntradaReparacion,
          dolarId: dolar?.id,
          fechaSalidaReparacion,
          kilometros,
          observacionesCliente,
          observacionesEntrada,
          observacionesSalida,
          estado,
          pdfPath,
          manoDeObra: new Prisma.Decimal(manoDeObra),
          descuento: new Prisma.Decimal(descuento),
          descripcionDescuento,
          mecanicos: {
            create: mecanicosToPersist,
          },
          repuestosUsados: {
            create: repuestosToPersist,
          },
          reparacionesDeTercero: {
            create: reparacionesDeTerceroToPersist,
          },
          trabajosRealizados: {
            create: trabajosRealizadosToPersist,
          },
          controlesEnReparacion: {
            create: controlesEnReparacionToPersist,
          },
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

      if (estado !== EstadoOrdenReparacion.Presupuestado) {
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
      }

      if (estado === EstadoOrdenReparacion.Terminado) {
        await prisma.pagoAMecanico.create({
          data: {
            ordenReparacionId: ordenCreada.id,
          },
        });
        await prisma.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: "Reparación Terminada",
            texto: `La reparación del auto ${ordenCreada.auto.brand} ${ordenCreada.auto.patent} se encuentra terminada. Tiene que pagar la mano de obra correspondiente.`,
            leida: false,
            ordenReparacionId: ordenCreada.id,
            tipo: TipoNotificacionInterna.REPARACION_TERMINADA,
          },
        });
        const io = getIO();
        if (io) {
          io.emit("newNotification");
        }
      }

      return [ordenCreada];
    });

    return NextResponse.json(nuevaOrdenReparacion, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de reparación:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
      console.error("Prisma error message:", error.message);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
