import prisma from "@/lib/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "0", 10);
    const size = Math.min(
      Math.max(parseInt(searchParams.get("size") ?? "10", 10), 1),
      200
    );
    const query = (searchParams.get("query") ?? "").trim();

    const skip = page * size;

    const where = query
      ? {
          OR: [
            { nombre: { contains: query } },
            { valor: { contains: query } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.configuracionGeneral.findMany({
        where,
        skip,
        take: size,
        orderBy: { nombre: "asc" },
      }),
      prisma.configuracionGeneral.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, valor } = body;

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (valor === undefined || valor === null) {
      return NextResponse.json(
        { error: "El valor es requerido" },
        { status: 400 }
      );
    }

    const created = await prisma.configuracionGeneral.create({
      data: {
        nombre: nombre.trim(),
        valor: String(valor),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
