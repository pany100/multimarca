import {
  AjustePrecioItem,
  TipoAjuste,
} from "@/core/domain/value-objects/ajuste-precio.vo";

export type Numerico =
  | number
  | string
  | { toString(): string }
  | null
  | undefined;

export interface OrdenDeCompraItemInput {
  precioUnitario: Numerico;
  iva: Numerico;
  cantidad: Numerico;
}

export interface AjustePrecioInput {
  descripcion: string;
  monto: Numerico;
  tipo: TipoAjuste;
  esDescuento: boolean;
  esInterno?: boolean;
  orden?: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const calcularSubtotalItem = (item: OrdenDeCompraItemInput): number => {
  const precio = Number(item.precioUnitario) || 0;
  const iva = Number(item.iva) || 0;
  const cantidad = Number(item.cantidad) || 0;
  return precio * (1 + iva / 100) * cantidad;
};

export const calcularSubtotalItems = (
  items: OrdenDeCompraItemInput[],
): number => items.reduce((acc, item) => acc + calcularSubtotalItem(item), 0);

const toAjustePrecioVO = (a: AjustePrecioInput) =>
  new AjustePrecioItem(
    a.descripcion,
    Number(a.monto) || 0,
    a.tipo,
    a.esDescuento,
    a.esInterno ?? false,
    a.orden ?? 0,
  );

export const calcularImpactoAjuste = (
  ajuste: AjustePrecioInput,
  base: number,
): number => toAjustePrecioVO(ajuste).aplicar(base);

export const calcularNetoAjustes = (
  ajustes: AjustePrecioInput[],
  base: number,
): number =>
  ajustes.reduce((acc, ajuste) => acc + calcularImpactoAjuste(ajuste, base), 0);

export const calcularBaseOrdenDeCompra = (
  items: OrdenDeCompraItemInput[],
  percepcion: Numerico,
): number => calcularSubtotalItems(items) + (Number(percepcion) || 0);

export const calcularPrecioTotalOrdenDeCompra = (
  items: OrdenDeCompraItemInput[],
  percepcion: Numerico,
  ajustes: AjustePrecioInput[] = [],
): number => {
  const base = calcularBaseOrdenDeCompra(items, percepcion);
  return round2(base + calcularNetoAjustes(ajustes, base));
};
