import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import { moveFileInS3 } from "@/utils/s3Helper";
import { EstadoVenta, Prisma, TipoNotificacionInterna } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("query") || "";
    const estado = searchParams.get("estado");

    const where: Prisma.VentaWhereInput = {
      OR: [
        { cliente: { fullName: { contains: query } } },
        { informacionCliente: { contains: query } },
        { id: { equals: parseInt(query) || undefined } },
      ],
    };

    // Add estado filter if provided
    if (estado) {
      where.estado = estado as EstadoVenta;
    }

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where,
        include: {
          cliente: true,
          repuestosUsados: {
            include: {
              stock: true,
            },
          },
          reparacionesDeTercero: true,
          trabajosRealizados: true,
          ingresos: true,
        },
        skip: page * limit,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.venta.count({ where }),
    ]);

    return NextResponse.json({
      items: ventas,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clienteId,
      descripcionDescuento,
      descripcionIncremento,
      descuento,
      fecha,
      informacionCliente,
      incremento,
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      estado,
    } = body;

    const isPresupuesto = estado === "Presupuestado";

    if (!isPresupuesto) {
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
    if (!clienteId && !informacionCliente) {
      return NextResponse.json(
        { error: "Debe proporcionar un cliente o información del cliente" },
        { status: 400 }
      );
    }

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

    const dolar = await prisma.dolar.findFirst({
      where: {
        fecha: {
          lte: new Date(fecha),
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const venta = await prisma.venta.create({
      data: {
        clienteId,
        informacionCliente,
        fecha,
        dolarId: dolar?.id,
        estado,
        descuento: descuento ? new Prisma.Decimal(descuento) : 0,
        descripcionDescuento,
        incremento: incremento ? new Prisma.Decimal(incremento) : 0,
        descripcionIncremento,
        repuestosUsados: {
          create: repuestosToPersist,
        },
        reparacionesDeTercero: {
          create: reparacionesDeTerceroToPersist,
        },
        trabajosRealizados: {
          create: trabajosRealizadosToPersist,
        },
      },
      include: {
        cliente: true,
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        reparacionesDeTercero: true,
        trabajosRealizados: true,
      },
    });

    if (!isPresupuesto) {
      for (const repuesto of repuestosUsados) {
        const stockActualizado = await prisma.stock.update({
          where: { id: repuesto.stock.id },
          data: { units: { decrement: repuesto.unidadesConsumidas } },
        });

        if (
          (stockActualizado.units ?? 0) <= (stockActualizado.restockValue ?? 0)
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

    return NextResponse.json(venta, {
      status: 201,
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: `Error al crear la venta: ${error}` },
      { status: 500 }
    );
  }
}
