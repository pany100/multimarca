/**
 * Calcula el precio de venta a partir del precio de compra, margen e IVA de venta.
 *
 * Fórmula:
 *   precioNeto = buyPrice * (1 + markup/100)
 *   precioVenta = precioNeto * (1 + sellIva/100)
 *
 * @returns precio de venta redondeado hacia arriba, o null si los inputs son inválidos.
 */
export function calcularPrecioVenta(
  buyPrice: unknown,
  markup: unknown,
  sellIva: unknown
): number | null {
  const b = buyPrice === "" || buyPrice == null ? NaN : Number(buyPrice);
  const m = markup === "" || markup == null ? 0 : Number(markup);
  const iva = sellIva === "" || sellIva == null ? 0 : Number(sellIva);
  if (!Number.isFinite(b) || b < 0) return null;
  if (!Number.isFinite(m)) return null;
  if (!Number.isFinite(iva)) return null;
  return Math.ceil(b * (1 + m / 100) * (1 + iva / 100) || 0);
}

/** Precio neto (sin IVA) = buyPrice * (1 + markup/100) */
export function calcularPrecioNeto(
  buyPrice: unknown,
  markup: unknown
): number | null {
  const b = buyPrice === "" || buyPrice == null ? NaN : Number(buyPrice);
  const m = markup === "" || markup == null ? 0 : Number(markup);
  if (!Number.isFinite(b) || b < 0) return null;
  if (!Number.isFinite(m)) return null;
  return b * (1 + m / 100);
}
