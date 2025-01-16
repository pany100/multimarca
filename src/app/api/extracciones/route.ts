import { getChequeForOperation, saveCheque } from "@/utils/chequeUtils";
import { OperacionCheque, TipoOperacion } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [extracciones, total] = await Promise.all([
      prisma.extraccion.findMany({
        where: {
          OR: [
            { motivo: { contains: query } },
            { usuario: { fullName: { contains: query } } },
          ],
        },
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: {
          usuario: {
            select: {
              fullName: true,
            },
          },
        },
      }),
      prisma.extraccion.count({
        where: {
          OR: [
            { motivo: { contains: query } },
            { usuario: { fullName: { contains: query } } },
          ],
        },
      }),
    ]);

    const extraccionesConCheques = await Promise.all(
      extracciones.map(async (extraccion) => {
        if (extraccion.tipoExtraccion === "CHEQUE") {
          const cheque = await getChequeForOperation(
            OperacionCheque.EXTRACCION,
            extraccion.id
          );
          return {
            ...extraccion,
            banco: cheque?.banco,
            emisor: cheque?.owner,
            fechaCobro: cheque?.fechaCobro,
            fechaEmision: cheque?.fechaEmision,
            importe: cheque?.importe,
            numeroCheque: cheque?.numero,
            picturePath: cheque?.picturePath,
            chequeId: cheque?.id,
          };
        }
        return extraccion;
      })
    );

    return NextResponse.json({
      items: extraccionesConCheques,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener extracciones:", error);
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
      usuarioId,
      motivo,
      moneda,
      fecha,
      tipoExtraccion,
      banco,
      emisor,
      fechaCobro,
      fechaEmision,
      importe,
      numeroCheque,
      picturePath,
    } = body;

    if (tipoExtraccion === TipoOperacion.CHEQUE) {
      if (
        !banco ||
        !emisor ||
        !fechaCobro ||
        !fechaEmision ||
        !importe ||
        !numeroCheque ||
        !picturePath
      ) {
        return NextResponse.json(
          { error: "Faltan datos para la operación de cheque" },
          { status: 400 }
        );
      }
    }

    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "Monto de extracción inválido o faltante" },
        { status: 400 }
      );
    }

    if (!usuarioId || typeof usuarioId !== "number") {
      return NextResponse.json(
        { error: "ID de usuario inválido o faltante" },
        { status: 400 }
      );
    }

    if (!motivo || typeof motivo !== "string") {
      return NextResponse.json(
        { error: "Motivo de extracción inválido o faltante" },
        { status: 400 }
      );
    }

    if (!moneda || !["Dolar", "Peso"].includes(moneda)) {
      return NextResponse.json(
        { error: "Moneda inválida o faltante" },
        { status: 400 }
      );
    }

    if (
      !tipoExtraccion ||
      ![
        "EFECTIVO",
        "TRANSFERENCIA",
        "CHEQUE",
        "DEBITO_AUTOMATICO_TARJETA_CREDITO",
      ].includes(tipoExtraccion)
    ) {
      return NextResponse.json(
        { error: "Tipo de extracción inválido o faltante" },
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

    const nuevaExtraccion = await prisma.extraccion.create({
      data: {
        monto,
        moneda,
        usuarioId,
        motivo,
        tipoExtraccion,
        fecha,
        dolarId: dolar?.id,
      },
      include: {
        usuario: {
          select: {
            fullName: true,
          },
        },
      },
    });

    const newCheque = await saveCheque({
      cheque: {
        banco,
        emisor,
        fechaCobro,
        fechaEmision,
        importe,
        numeroCheque,
        picturePath,
      },
      tipoOperacion: tipoExtraccion,
      operacionCheque: OperacionCheque.EXTRACCION,
      idOperacion: nuevaExtraccion.id,
    });

    const extraccionToReturn = {
      ...nuevaExtraccion,
      banco: newCheque?.banco,
      emisor: newCheque?.owner,
      fechaCobro: newCheque?.fechaCobro,
      fechaEmision: newCheque?.fechaEmision,
      importe: newCheque?.importe,
      numeroCheque: newCheque?.numero,
      picturePath: newCheque?.picturePath,
      chequeId: newCheque?.id,
    };

    return NextResponse.json(extraccionToReturn, { status: 201 });
  } catch (error) {
    console.error("Error al crear extracción:", error);
    return NextResponse.json(
      { error: "No se pudo crear la extracción" },
      { status: 500 }
    );
  }
}
