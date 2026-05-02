import prisma from "@/lib/prisma";
import { calcularPrecioTotalOrdenDeCompra } from "./orden-de-compra-total.service";

type PrismaLike = typeof prisma;

export const recalcularPrecioTotalOrdenDeCompra = async (
  ordenDeCompraId: number,
  client: PrismaLike = prisma,
): Promise<void> => {
  const orden = await client.ordenDeCompra.findUnique({
    where: { id: ordenDeCompraId },
    include: { items: true, ajustesPrecio: true },
  });
  if (!orden) return;

  const precioTotal = calcularPrecioTotalOrdenDeCompra(
    orden.items,
    orden.percepcion,
    orden.ajustesPrecio.map((a) => ({
      descripcion: a.descripcion,
      monto: Number(a.monto),
      tipo: a.tipo,
      esDescuento: a.esDescuento,
      esInterno: a.esInterno,
      orden: a.orden,
    })),
  );

  await client.ordenDeCompra.update({
    where: { id: ordenDeCompraId },
    data: { precioTotal },
  });
};
