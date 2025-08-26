import { Money } from "./money.vo";

export interface ReparacionTerceroProps {
  nombre: string;
  proveedorId: number;
  precioCompra?: number;
  precioVenta?: number;
  recibo?: string | null;
}

export class ReparacionTercero {
  constructor(
    public readonly nombre: string,
    public readonly proveedorId: number,
    public readonly precioCompra: Money,
    public readonly precioVenta: Money,
    public readonly recibo: string | null
  ) {
    if (!nombre?.trim()) throw new Error("Nombre requerido");
  }
  static from(p: ReparacionTerceroProps) {
    return new ReparacionTercero(
      p.nombre.trim(),
      Number(p.proveedorId),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      p.recibo ?? null
    );
  }
}
