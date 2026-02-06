import { Decimal } from "@prisma/client/runtime/library";
import { Money } from "./money.vo";

function normalizeDiasParaRecordatorio(
  value?: number | number[] | null,
): number[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.filter((n) => typeof n === "number");
  return [value];
}

export interface TrabajoRealizadoProps {
  descripcion: string;
  precioUnitario: number;
  diasParaRecordatorio?: number[] | null;
}

export interface TrabajosRealizadosHTTPInput {
  precioUnitario: number;
  manoDeObra?:
    | {
        name: string;
      }
    | undefined;
  descripcion?: string | undefined;
  diasParaRecordatorio?: number[] | null | undefined;
}

export class TrabajoRealizado {
  constructor(
    public readonly descripcion: string,
    public readonly precioUnitario: Money,
    public readonly diasParaRecordatorio: number[],
  ) {
    if (!descripcion?.trim()) throw new Error("Descripción requerida");
  }
  static from(p: TrabajoRealizadoProps) {
    return new TrabajoRealizado(
      p.descripcion.trim(),
      Money.from(p.precioUnitario),
      normalizeDiasParaRecordatorio(p.diasParaRecordatorio),
    );
  }

  static fromHttpInput(p: TrabajosRealizadosHTTPInput) {
    return new TrabajoRealizado(
      p.manoDeObra?.name ?? p.descripcion ?? "",
      Money.from(p.precioUnitario),
      normalizeDiasParaRecordatorio(p.diasParaRecordatorio),
    );
  }

  static fromOrderDb(p: {
    precioUnitario: Decimal;
    descripcion: string;
    diasParaRecordatorio?: number | number[] | null;
  }) {
    return new TrabajoRealizado(
      p.descripcion.trim(),
      Money.from(p.precioUnitario),
      normalizeDiasParaRecordatorio(p.diasParaRecordatorio),
    );
  }
}
