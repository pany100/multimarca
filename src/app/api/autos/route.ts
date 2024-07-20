import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [autos, total] = await Promise.all([
      prisma.auto.findMany({
        where: {
          OR: [
            { patent: { contains: query } },
            { brand: { contains: query } },
            { model: { contains: query } },
          ],
        },
        include: {
          owner: true,
        },
        skip,
        take: size,
        orderBy: { patent: "asc" },
      }),
      prisma.auto.count({
        where: {
          OR: [
            { patent: { contains: query } },
            { brand: { contains: query } },
            { model: { contains: query } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      items: autos,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener autos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nuevoAuto = await prisma.auto.create({
      data: {
        patent: body.patent,
        model: body.model,
        brand: body.brand,
        color: body.color,
        year:
          typeof body.year === "string" ? parseInt(body.year, 10) : body.year,
        kms: typeof body.kms === "string" ? parseInt(body.kms, 10) : body.kms,
        valves:
          typeof body.valves === "string"
            ? parseInt(body.valves, 10)
            : body.valves,
        ownerId: body.ownerId,
        chassis_number: body.chassis_number,
        engine_number: body.engine_number,
        observations: body.observations,
        transmission_type: body.transmission_type,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(nuevoAuto, { status: 201 });
  } catch (error) {
    console.error("Error al crear auto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
