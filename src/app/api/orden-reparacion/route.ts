import { Prisma } from "@prisma/client";
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
      estado: presupuestos ? "Presupuestado" : { not: "Presupuestado" },
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
          controlesEnReparacion: {
            include: {
              controlMecanico: true,
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
      kilometros,
      observacionesCliente,
      observacionesEntrada = "[]",
      observacionesSalida = "[]",
      estado,
      pdfPath,
      mecanicosIds = [],
      repuestosUsados = [],
      reparacionesDeTercero = [],
      trabajosRealizados = [],
      montoTotalCliente,
    } = body;

    // Validar que los repuestos usados no excedan el stock actual
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

    const nuevaOrdenReparacion = await prisma.ordenReparacion.create({
      data: {
        autoId: parseInt(autoId),
        fechaEntradaReparacion,
        fechaSalidaReparacion,
        kilometros,
        observacionesCliente,
        observacionesEntrada,
        observacionesSalida,
        estado,
        pdfPath,
        montoTotalCliente: new Prisma.Decimal(montoTotalCliente),
        mecanicos: {
          connect: mecanicosIds.map((id: number) => ({ id })),
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
