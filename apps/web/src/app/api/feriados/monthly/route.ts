import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // Validate required parameters
    if (!year || !month) {
      return NextResponse.json(
        { error: "Se requieren los parámetros 'year' y 'month'" },
        { status: 400 }
      );
    }

    // Parse parameters
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Validate parameters are valid numbers
    if (isNaN(yearNum) || isNaN(monthNum)) {
      return NextResponse.json(
        { error: "Los parámetros 'year' y 'month' deben ser números" },
        { status: 400 }
      );
    }

    // Validate month is between 1-12
    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "El parámetro 'month' debe estar entre 1 y 12" },
        { status: 400 }
      );
    }

    // Create date range for the specified month
    const startDate = new Date(yearNum, monthNum - 1, 1); // Month is 0-indexed in JS Date
    const endDate = new Date(yearNum, monthNum, 0); // Last day of the month

    // Query feriados within the date range
    const feriados = await prisma.feriado.findMany({
      where: {
        fecha: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        fecha: "asc",
      },
    });

    return NextResponse.json(feriados);
  } catch (error) {
    console.error("Error al obtener feriados del mes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
