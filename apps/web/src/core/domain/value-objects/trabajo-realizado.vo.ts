import { Decimal } from "@prisma/client/runtime/library";
import { Money } from "./money.vo";

function normalizeDiasParaRecordatorio(value?: unknown): number[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.filter((n) => typeof n === "number") as number[];
  if (typeof value === "number") return [value];
  return [];
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
  /** Acepta número único (legacy) o array de días; fromHttpInput normaliza a number[] */
  diasParaRecordatorio?: number | number[] | null | undefined;
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
    /** Prisma devuelve JsonValue (number | number[] | null); se normaliza a number[] */
    diasParaRecordatorio?: unknown;
  }) {
    return new TrabajoRealizado(
      p.descripcion.trim(),
      Money.from(p.precioUnitario),
      normalizeDiasParaRecordatorio(p.diasParaRecordatorio),
    );
  }
}
