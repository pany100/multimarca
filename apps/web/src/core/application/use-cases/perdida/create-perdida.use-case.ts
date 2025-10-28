import type { PerdidaRepository } from "@/core/domain/repositories/perdida.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { Moneda } from "@prisma/client";

export interface CreatePerdidaDto {
  fecha?: Date;
  monto: number;
  descripcion: string;
  moneda?: string | null;
  cotizacionDolar?: number | null;
}

export class CreatePerdidaUseCase {
  constructor(private readonly repo: PerdidaRepository) {}

  async execute(input: CreatePerdidaDto) {
    // Find the most recent dollar exchange rate for the given date
    const fecha = input.fecha || new Date();
    const dolar = await prisma.dolar.findFirst({
      where: {
        fecha: {
          lte: fecha,
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const result = await this.repo.create({
      data: {
        data: {
          fecha,
          monto: input.monto,
          descripcion: input.descripcion,
          moneda: input.moneda as Moneda | undefined,
          cotizacionDolar: input.cotizacionDolar || undefined,
          dolarId: dolar?.id || undefined,
        },
      },
    });

    return result;
  }
}
