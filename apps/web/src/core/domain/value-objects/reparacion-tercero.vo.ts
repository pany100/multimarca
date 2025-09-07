import { Prisma } from "@prisma/client";
import { FileStoragePort } from "../ports/file-storage.port";
import { Money } from "./money.vo";

export interface ReparacionTerceroProps {
  nombre: string;
  proveedorId: number;
  precioCompra?: number;
  precioVenta?: number;
  recibo?: string | null;
}

export interface ReparacionTerceroHTTPInput {
  nombre: string;
  proveedor: {
    id: number;
  };
  precioCompra?: number | undefined;
  precioVenta?: number | undefined;
  recibo?: string | null | undefined;
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
  static from(p: ReparacionTerceroProps, files: FileStoragePort) {
    return new ReparacionTercero(
      p.nombre.trim(),
      Number(p.proveedorId),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      p.recibo ?? null
    );
  }

  static fromHttpInput(p: ReparacionTerceroHTTPInput) {
    return new ReparacionTercero(
      p.nombre.trim(),
      Number(p.proveedor.id),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      p.recibo ?? null
    );
  }

  static fromOrderDb(p: {
    nombre: string;
    precioCompra: Prisma.Decimal;
    precioVenta: Prisma.Decimal;
  }) {
    return new ReparacionTercero(
      p.nombre.trim(),
      0,
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      null
    );
  }
}
