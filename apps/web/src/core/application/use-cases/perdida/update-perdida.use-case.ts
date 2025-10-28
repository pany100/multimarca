import type { PerdidaRepository } from "@/core/domain/repositories/perdida.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { Moneda } from "@prisma/client";

export interface UpdatePerdidaDto {
  id: number;
  fecha?: Date;
  monto: number;
  descripcion: string;
  moneda?: string | null;
  cotizacionDolar?: number | null;
}

export class UpdatePerdidaUseCase {
  constructor(private readonly repo: PerdidaRepository) {}

  async execute(input: UpdatePerdidaDto) {
    // Check if perdida exists
    const existingPerdida = await this.repo.findById(input.id);
    if (!existingPerdida) {
      throw new Error("Registro de pérdida no encontrado");
    }

    // Find the most recent dollar exchange rate for the given date
    const fecha = input.fecha || existingPerdida.fecha;
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

    const result = await this.repo.update({
      data: {
        where: { id: input.id },
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
