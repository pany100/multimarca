import {
  chequeQueryData,
  getChequeIdAndValidate,
  returnAllModelsWithChequeData,
  returnModelWithChequeData,
  validateChequeRequest,
} from "@/utils/chequeUtils";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [ingresos, total] = await Promise.all([
      prisma.ingresoManualDeDinero.findMany({
        where: {
          descripcion: { contains: query },
        },
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: {
          dolar: true,
          usuario: {
            select: {
              fullName: true,
            },
          },
          tipoOperacion: true,
          cheque: chequeQueryData,
        },
      }),
      prisma.ingresoManualDeDinero.count({
        where: {
          descripcion: { contains: query },
        },
      }),
    ]);

    return NextResponse.json({
      items: returnAllModelsWithChequeData(ingresos),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener ingresos manuales:", error);
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
      monto,
      descripcion,
      moneda,
      fecha,
      usuarioId,
      tipoOperacionId,
      cotizacionDolar,
      gastosBancarios,
      gastosArba,
    } = body;

    if (!validateChequeRequest(body, tipoOperacionId)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "Monto de ingreso inválido o faltante" },
        { status: 400 }
      );
    }

    if (!descripcion || typeof descripcion !== "string") {
      return NextResponse.json(
        { error: "Descripción inválida o faltante" },
        { status: 400 }
      );
    }

    if (!moneda || !["Dolar", "Peso"].includes(moneda)) {
      return NextResponse.json(
        { error: "Moneda inválida o faltante" },
        { status: 400 }
      );
    }

    if (!usuarioId || typeof usuarioId !== "number") {
      return NextResponse.json(
        { error: "ID de usuario inválido o faltante" },
        { status: 400 }
      );
    }

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

    if (moneda === "Dolar" && !dolar) {
      return NextResponse.json(
        {
          error: "No hay cotización de dólar disponible para la fecha indicada",
        },
        { status: 400 }
      );
    }

    let chequeIdToPass = null;
    try {
      chequeIdToPass = await getChequeIdAndValidate(body, tipoOperacionId);
    } catch (error) {
      return NextResponse.json(
        { error: "No se pudo usar el cheque" },
        { status: 400 }
      );
    }
    const nuevoIngreso = await prisma.ingresoManualDeDinero.create({
      data: {
        monto,
        moneda,
        descripcion,
        fecha: new Date(fecha),
        dolarId: dolar?.id,
        usuarioId,
        tipoOperacionId,
        chequeId: chequeIdToPass,
        cotizacionDolar,
        gastosBancarios,
        gastosArba,
      },
      include: {
        dolar: true,
        usuario: {
          select: {
            fullName: true,
          },
        },
        cheque: chequeQueryData,
      },
    });

    return NextResponse.json(returnModelWithChequeData(nuevoIngreso), {
      status: 201,
    });
  } catch (error) {
    console.error("Error al crear ingreso manual:", error);
    return NextResponse.json(
      { error: "No se pudo crear el ingreso manual" },
      { status: 500 }
    );
  }
}
