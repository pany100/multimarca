import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const presupuestos = searchParams.get("presupuestos") === "true";

    const skip = page * size;

    const whereClause = {
      OR: [
        { auto: { patent: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
        { auto: { owner: { fullName: { contains: query } } } },
      ],
      status: presupuestos ? "Presupuestado" : { not: "Presupuestado" },
    };

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
      kilometros,
      observacionesCliente,
      observacionesEntrada,
      observacionesSalida,
      estado,
      precioManoObra,
      pdfPath,
      mecanicosIds,
      repuestosUsados,
      reparacionesDeTercero,
      trabajosRealizados,
      controlesEnReparacion,
      pagos,
      montoTotalCliente,
    } = body;

    // Validar que los repuestos usados no excedan el stock actual
    for (const repuesto of repuestosUsados) {
      const stockActual = await prisma.stock.findUnique({
        where: { id: repuesto.stockId },
        select: { units: true },
      });

      if (
        !stockActual ||
        (stockActual.units ?? 0) < repuesto.unidadesConsumidas
      ) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para el repuesto con ID ${repuesto.stockId}`,
          },
          { status: 400 }
        );
      }
    }

    const nuevaOrdenReparacion = await prisma.ordenReparacion.create({
      data: {
        autoId,
        fechaEntradaReparacion,
        fechaSalidaReparacion,
        kilometros,
        observacionesCliente,
        observacionesEntrada,
        observacionesSalida,
        estado,
        precioManoObra,
        pdfPath,
        montoTotalCliente,
        mecanicos: {
          connect: mecanicosIds.map((id: number) => ({ id })),
        },
        repuestosUsados: {
          create: repuestosUsados,
        },
        reparacionesDeTercero: {
          connect: reparacionesDeTercero.map((id: number) => ({ id })),
        },
        trabajosRealizados: {
          create: trabajosRealizados,
        },
        controlesEnReparacion: {
          create: controlesEnReparacion,
        },
        pagos: {
          create: pagos,
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

    return NextResponse.json(nuevaOrdenReparacion, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de reparación:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
