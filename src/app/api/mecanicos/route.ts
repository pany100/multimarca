import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [mecanicos, total] = await Promise.all([
      prisma.mecanico.findMany({
        where: {
          name: { contains: query },
        },
        skip,
        take: size,
        orderBy: { name: "asc" },
      }),
      prisma.mecanico.count({
        where: {
          name: { contains: query },
        },
      }),
    ]);
    // Convertir BigInt a string para serialización
    const mecanicosSerializables = mecanicos.map((mecanico) => ({
      ...mecanico,
      dni: mecanico.dni ? mecanico.dni.toString() : null,
    }));

    return NextResponse.json({
      items: mecanicosSerializables,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener mecánicos:", error);
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
      name,
      start_date,
      dni,
      address,
      city,
      state,
      postal_code,
      email,
      phone,
      birthday,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de mecánico inválido o faltante" },
        { status: 400 }
      );
    }

    const nuevoMecanico = await prisma.mecanico.create({
      data: {
        name,
        start_date: start_date ? new Date(start_date) : null,
        dni: dni ? BigInt(dni) : null,
        address,
        city,
        state,
        postal_code,
        email,
        phone,
        birthday: birthday ? new Date(birthday) : null,
      },
    });
    const mecanicoSerializable = {
      ...nuevoMecanico,
      dni: nuevoMecanico.dni ? nuevoMecanico.dni.toString() : null,
    };
    return NextResponse.json(mecanicoSerializable, { status: 201 });
  } catch (error) {
    console.error("Error al crear mecánico:", error);
    return NextResponse.json(
      { error: "No se pudo crear el mecánico" },
      { status: 500 }
    );
  }
}
