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
  static async from(p: ReparacionTerceroProps, files: FileStoragePort) {
    let recibo = p.recibo ?? null;
    if (recibo && typeof recibo === "string" && recibo.includes("/tmp/")) {
      recibo = await files.moveTempTo(recibo, "recibos");
    }
    return new ReparacionTercero(
      p.nombre.trim(),
      Number(p.proveedorId),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      recibo
    );
  }

  static async fromHttpInput(
    p: ReparacionTerceroHTTPInput,
    files: FileStoragePort
  ) {
    let recibo = p.recibo ?? null;
    if (recibo && typeof recibo === "string" && recibo.includes("/tmp/")) {
      recibo = await files.moveTempTo(recibo, "recibos");
    }
    return new ReparacionTercero(
      p.nombre.trim(),
      Number(p.proveedor.id),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      recibo
    );
  }
}
