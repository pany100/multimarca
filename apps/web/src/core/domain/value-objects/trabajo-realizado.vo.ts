import { Money } from "./money.vo";

export interface TrabajoRealizadoProps {
  descripcion: string;
  precioUnitario: number;
  diasParaRecordatorio?: number | null;
}

export class TrabajoRealizado {
  constructor(
    public readonly descripcion: string,
    public readonly precioUnitario: Money,
    public readonly diasParaRecordatorio: number | null
  ) {
    if (!descripcion?.trim()) throw new Error("Descripción requerida");
  }
  static from(p: TrabajoRealizadoProps) {
    return new TrabajoRealizado(
      p.descripcion.trim(),
      Money.from(p.precioUnitario),
      p.diasParaRecordatorio ?? null
    );
  }
}
