import {
  getOperacionesByChequeId,
  mapChequeForResponse,
  saveCheque,
} from "@/utils/chequeUtils";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      numero,
      banco,
      owner,
      importe,
      fechaEmision,
      fechaCobro,
      picturePath,
    } = body ?? {};

    const missing: string[] = [];
    if (!numero) missing.push("numero");
    if (!banco) missing.push("banco");
    if (!owner) missing.push("owner");
    if (importe === undefined || importe === null || importe === "")
      missing.push("importe");
    if (!fechaEmision) missing.push("fechaEmision");
    if (!fechaCobro) missing.push("fechaCobro");
    if (!picturePath) missing.push("picturePath");
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos del cheque: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const importeNumber = Number(importe);
    if (Number.isNaN(importeNumber)) {
      return NextResponse.json(
        { error: "El importe debe ser un número" },
        { status: 400 }
      );
    }

    const existing = await prisma.cheque.findUnique({
      where: { numero: String(numero) },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un cheque con número ${numero}` },
        { status: 409 }
      );
    }

    const newCheque = await saveCheque({
      cheque: {
        banco,
        emisor: owner,
        fechaCobro: new Date(fechaCobro),
        fechaEmision: new Date(fechaEmision),
        importe: importeNumber,
        numeroCheque: String(numero),
        picturePath,
      },
    });

    const created = await prisma.cheque.findUnique({
      where: { id: newCheque.id },
      include: { fotoFile: true },
    });

    return NextResponse.json(mapChequeForResponse(created!), { status: 201 });
  } catch (error) {
    console.error("Error al crear cheque:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const whereClause: any = {
      OR: [
        { id: { equals: parseInt(query) || undefined } },
        { numero: { contains: query } },
        { banco: { contains: query } },
        { owner: { contains: query } },
      ],
    };

    // If there's a query, add formatted date search for both fechaEmision and fechaCobro
    if (query && query.trim() !== "") {
      // Use raw query to find cheques where the formatted dates contain the query
      const formattedDateMatches = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM Cheque 
        WHERE DATE_FORMAT(fechaEmision, '%e/%c/%Y') LIKE ${`%${query}%`}
        OR DATE_FORMAT(fechaCobro, '%e/%c/%Y') LIKE ${`%${query}%`}
      `;

      // Only add to OR clause if we found matches
      if (formattedDateMatches.length > 0) {
        const matchingIds = formattedDateMatches.map((match) => match.id);
        whereClause.OR.push({ id: { in: matchingIds } });
      }
    }

    const [cheques, total] = await Promise.all([
      prisma.cheque.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { fotoFile: true },
      }),
      prisma.cheque.count({
        where: whereClause,
      }),
    ]);

    // Get operations for each cheque
    const chequesWithOperaciones = await Promise.all(
      cheques.map(async (cheque) => {
        const operaciones = await getOperacionesByChequeId(cheque.id);
        const { fotoFile, ...rest } = cheque;
        return {
          ...rest,
          picturePath:
            fotoFile?.finalPath ?? fotoFile?.tempPath ?? null,
          rechazado: cheque.rechazado ? "Si" : "No",
          operaciones,
        };
      })
    );

    return NextResponse.json({
      items: chequesWithOperaciones,
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
