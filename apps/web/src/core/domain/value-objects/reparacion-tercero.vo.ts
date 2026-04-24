import { Prisma } from "@prisma/client";
import { FileStoragePort } from "../ports/file-storage.port";
import { Money } from "./money.vo";

export interface ReparacionTerceroProps {
  nombre: string;
  proveedorId: number;
  cantidad?: number;
  precioCompra?: number;
  precioVenta?: number;
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
  recibo?: string | null;
}

export interface ReparacionTerceroHTTPInput {
  nombre: string;
  proveedor: {
    id: number;
  };
  cantidad?: number | undefined;
  precioCompra?: number | undefined;
  precioVenta?: number | undefined;
  iva?: number | null | undefined;
  buyIva?: number | null | undefined;
  markup?: number | null | undefined;
  recibo?: string | null | undefined;
}

export class ReparacionTercero {
  constructor(
    public readonly nombre: string,
    public readonly proveedorId: number,
    public readonly cantidad: number,
    public readonly precioCompra: Money,
    public readonly precioVenta: Money,
    public readonly iva: number | null,
    public readonly buyIva: number | null,
    public readonly markup: number | null,
    public readonly recibo: string | null
  ) {
    if (!nombre?.trim()) throw new Error("Nombre requerido");
    const c = Number(cantidad);
    if (!Number.isFinite(c) || c <= 0) {
      throw new Error("Cantidad inválida");
    }
  }

  static calcularPrecioVenta(
    precioCompra: number,
    markup: number,
    iva: number
  ): number {
    return Math.round(
      precioCompra * (1 + markup / 100) * (1 + iva / 100) || 0
    );
  }

  static from(p: ReparacionTerceroProps, files: FileStoragePort) {
    return new ReparacionTercero(
      p.nombre.trim(),
      Number(p.proveedorId),
      Number(p.cantidad ?? 1),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      p.iva ?? null,
      p.buyIva ?? null,
      p.markup ?? null,
      p.recibo ?? null
    );
  }

  static fromHttpInput(p: ReparacionTerceroHTTPInput) {
    return new ReparacionTercero(
      p.nombre.trim(),
      Number(p.proveedor.id),
      Number(p.cantidad ?? 1),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      p.iva ?? null,
      p.buyIva ?? null,
      p.markup ?? null,
      p.recibo ?? null
    );
  }

  static fromOrderDb(p: {
    nombre: string;
    precioCompra: Prisma.Decimal;
    precioVenta: Prisma.Decimal;
    cantidad?: Prisma.Decimal | number | null;
  }) {
    return new ReparacionTercero(
      p.nombre.trim(),
      0,
      Number(p.cantidad ?? 1),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      null,
      null,
      null,
      null
    );
  }
}
