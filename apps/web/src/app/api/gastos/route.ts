import { ListGastosUseCase } from "@/core/application/use-cases/gasto/list-gastos.use-case";
import { PrismaGastoRepository } from "@/core/infrastructure/database/repositories/prisma-gasto.repository";
import { listGastosQuerySchema } from "@/core/infrastructure/validation/schemas/gasto.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import {
  chequeQueryData,
  getChequeIdAndValidate,
  returnAllModelsWithChequeData,
  returnModelWithChequeData,
  validateChequeRequest,
} from "@/utils/chequeUtils";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: searchParams.get("page") || "0",
        size: searchParams.get("pageSize") || searchParams.get("size") || "10",
        query: searchParams.get("query") || "",
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      },
      listGastosQuerySchema
    );

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const user = await prisma.usuario.findUnique({
      where: { id: decodedToken.userId },
      include: { rol: true },
    });

    if (!user || !user.rol) {
      return NextResponse.json(
        { error: "Usuario no tiene rol asignado" },
        { status: 403 }
      );
    }

    const result = await new ListGastosUseCase(
      new PrismaGastoRepository()
    ).execute({ ...dto, userRoleName: user.rol.name });

    return NextResponse.json({
      ...result,
      items: returnAllModelsWithChequeData(result.items),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      precio,
      fecha,
      categoriaId,
      mecanicoId,
      tipoOperacionId,
      proveedorId,
      moneda,
      detalle,
      cotizacionDolar,
      gastosBancarios,
      gastosArba,
    } = body;

    if (!validateChequeRequest(body, tipoOperacionId)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    if (!nombre || !precio || !fecha || !categoriaId) {
      return NextResponse.json(
        { error: "Datos de gasto inválidos o faltantes" },
        { status: 400 }
      );
    }

    if (!moneda || !["Dolar", "Peso"].includes(moneda)) {
      return NextResponse.json(
        { error: "Moneda inválida o faltante" },
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

    let chequeIdToPass = null;
    try {
      chequeIdToPass = await getChequeIdAndValidate(body, tipoOperacionId);
    } catch (error) {
      return NextResponse.json(
        { error: "No se pudo usar el cheque" },
        { status: 400 }
      );
    }

    const nuevoGasto = await prisma.gasto.create({
      data: {
        nombre,
        moneda,
        precio,
        fecha: new Date(fecha),
        categoriaId,
        mecanicoId,
        proveedorId,
        tipoOperacionId,
        detalle,
        dolarId: dolar?.id,
        chequeId: chequeIdToPass,
        cotizacionDolar,
        gastosBancarios,
        gastosArba,
      },
      include: {
        categoria: true,
        mecanico: true,
        proveedor: true,
        cheque: chequeQueryData,
      },
    });

    return NextResponse.json(returnModelWithChequeData(nuevoGasto), {
      status: 201,
    });
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json(
      { error: "No se pudo crear el gasto" },
      { status: 500 }
    );
  }
}
