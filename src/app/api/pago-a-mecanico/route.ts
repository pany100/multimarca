import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const onlyNullMonto = searchParams.get("onlyNullMonto") === "true";

    const skip = page * size;

    let whereClause: any = {
      OR: [
        { ordenReparacion: { id: { equals: parseInt(query) || undefined } } },
        { id: { equals: parseInt(query) || undefined } },
      ],
    };

    if (onlyNullMonto) {
      whereClause = {
        ...whereClause,
        monto: null,
      };
    }

    const [pagosAMecanico, total] = await Promise.all([
      prisma.pagoAMecanico.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { fechaPago: "desc" },
        include: {
          ordenReparacion: {
            include: {
              auto: {
                include: {
                  owner: true,
                },
              },
            },
          },
        },
      }),
      prisma.pagoAMecanico.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: pagosAMecanico,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener pagos a mecánico:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
