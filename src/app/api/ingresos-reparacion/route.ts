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

    const [ingresos, total] = await Promise.all([
      prisma.ingresoPorReparacion.findMany({
        where: {
          OR: [
            { cliente: { fullName: { contains: query } } },
            { ordenReparacion: { auto: { patent: { contains: query } } } },
          ],
        },
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: {
          cliente: true,
          ordenReparacion: {
            include: {
              auto: true,
            },
          },
        },
      }),
      prisma.ingresoPorReparacion.count({
        where: {
          OR: [
            { cliente: { fullName: { contains: query } } },
            { ordenReparacion: { auto: { patent: { contains: query } } } },
          ],
        },
      }),
    ]);

    const ingresosConCheques = await Promise.all(
      ingresos.map(async (ingreso) => {
        if (ingreso.tipoOperacion === "CHEQUE") {
          const cheque = await getChequeForOperation(
            OperacionCheque.INGRESO_REPARACION,
            ingreso.id
          );
          return {
            ...ingreso,
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
        return ingreso;
      })
    );

    return NextResponse.json({
      items: ingresosConCheques,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener ingresos por reparación:", error);
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
      clienteId,
      monto,
      fecha,
      moneda,
      tipoOperacion,
      descripcion,
      ordenReparacionId,
      banco,
      emisor,
      fechaCobro,
      fechaEmision,
      importe,
      numeroCheque,
      picturePath,
    } = body;

    if (tipoOperacion === TipoOperacion.CHEQUE) {
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

    if (
      !clienteId ||
      !monto ||
      !fecha ||
      !moneda ||
      !descripcion ||
      !ordenReparacionId ||
      !tipoOperacion
    ) {
      return NextResponse.json(
        { error: "Datos de ingreso por reparación inválidos o faltantes" },
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

    const nuevoIngreso = await prisma.ingresoPorReparacion.create({
      data: {
        clienteId,
        monto,
        moneda,
        descripcion,
        ordenReparacionId,
        fecha,
        dolarId: dolar?.id,
        tipoOperacion,
      },
      include: {
        cliente: true,
        ordenReparacion: {
          include: {
            auto: true,
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
      tipoOperacion,
      operacionCheque: OperacionCheque.INGRESO_REPARACION,
      idOperacion: nuevoIngreso.id,
    });

    const ingresoToReturn = {
      ...nuevoIngreso,
      banco: newCheque?.banco,
      emisor: newCheque?.owner,
      fechaCobro: newCheque?.fechaCobro,
      fechaEmision: newCheque?.fechaEmision,
      importe: newCheque?.importe,
      numeroCheque: newCheque?.numero,
      picturePath: newCheque?.picturePath,
      chequeId: newCheque?.id,
    };

    return NextResponse.json(ingresoToReturn, { status: 201 });
  } catch (error) {
    console.error("Error al crear ingreso por reparación:", error);
    return NextResponse.json(
      { error: "No se pudo crear el ingreso por reparación" },
      { status: 500 }
    );
  }
}
