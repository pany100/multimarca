import { OperacionCheque } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [cheques, total] = await Promise.all([
      prisma.cheque.findMany({
        where: {
          numero: { contains: query },
        },
        skip,
        take: size,
        orderBy: { fechaCobro: "asc" },
      }),
      prisma.cheque.count({
        where: {
          numero: { contains: query },
        },
      }),
    ]);

    // Obtener las entidades relacionadas para cada cheque
    const chequesConEntidades = await Promise.all(
      cheques.map(async (cheque) => {
        if (cheque.operacionCheque === OperacionCheque.VENTA) {
          const venta = await prisma.venta.findUnique({
            where: { id: cheque.operacionId },
            include: {
              cliente: true,
              items: {
                include: {
                  stock: true,
                },
              },
            },
          });
          return {
            ...cheque,
            entidad: venta,
          };
        }
        if (cheque.operacionCheque === OperacionCheque.INGRESO_MANUAL) {
          const ingresoManual = await prisma.ingresoManualDeDinero.findUnique({
            where: { id: cheque.operacionId },
            include: {
              usuario: {
                select: {
                  fullName: true,
                },
              },
            },
          });
          return {
            ...cheque,
            entidad: ingresoManual,
          };
        }
        if (cheque.operacionCheque === OperacionCheque.EXTRACCION) {
          const extraccion = await prisma.extraccion.findUnique({
            where: { id: cheque.operacionId },
            include: {
              usuario: {
                select: {
                  fullName: true,
                },
              },
            },
          });
          return { ...cheque, entidad: extraccion };
        }
        if (cheque.operacionCheque === OperacionCheque.GASTO) {
          const gasto = await prisma.gasto.findUnique({
            where: { id: cheque.operacionId },
          });
          return { ...cheque, entidad: gasto };
        }
        return cheque;
      })
    );

    return NextResponse.json({
      items: chequesConEntidades,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener cheques:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
