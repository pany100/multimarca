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

    return NextResponse.json({
      items: ingresos,
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
    } = body;

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

    return NextResponse.json(nuevoIngreso, { status: 201 });
  } catch (error) {
    console.error("Error al crear ingreso por reparación:", error);
    return NextResponse.json(
      { error: "No se pudo crear el ingreso por reparación" },
      { status: 500 }
    );
  }
}
