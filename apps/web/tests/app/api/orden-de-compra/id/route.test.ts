import { DELETE, PUT } from "@/app/api/orden-de-compra/[id]/route";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest } from "next/server";
import {
  createOrdenDeCompra,
  createProveedor,
  createStock,
} from "tests/factory";

describe("PUT /api/orden-de-compra/[id]", () => {
  it("debe editar una orden de compra y actualizar el stock correctamente", async () => {
    const proveedor = await createProveedor();
    const stock1 = await createStock(proveedor.id, { units: 10 });
    const stock2 = await createStock(proveedor.id, { units: 20 });

    const ordenDeCompra = await createOrdenDeCompra(proveedor.id, [
      { stockId: stock1.id, cantidad: 5 },
    ]);

    const datosActualizados = {
      fecha: new Date().toISOString(),
      precioTotal: 2000,
      proveedorId: proveedor.id,
      items: [{ stockId: stock2.id, cantidad: 8 }],
    };

    const request = new NextRequest(
      `http://localhost:3000/api/orden-de-compra/${ordenDeCompra.id}`,
      {
        method: "PUT",
        body: JSON.stringify(datosActualizados),
      }
    );

    const params = { id: ordenDeCompra.id.toString() };
    const response = await PUT(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);

    // Verificar que el stock1 se haya revertido
    const stockActualizado1 = await prisma.stock.findUnique({
      where: { id: stock1.id },
    });
    expect(stockActualizado1?.units).toBe(10); // 10 (original) + 5 (añadido) - 5 (revertido)

    // Verificar que el stock2 se haya actualizado
    const stockActualizado2 = await prisma.stock.findUnique({
      where: { id: stock2.id },
    });
    expect(stockActualizado2?.units).toBe(28); // 20 (original) + 8 (añadido)

    // Verificar que la orden de compra se haya actualizado correctamente
    expect(data.precioTotal).toEqual(
      new Decimal(datosActualizados.precioTotal)
    );
    expect(data.items).toHaveLength(1);
    expect(data.items[0].stockId).toBe(stock2.id);
    expect(data.items[0].cantidad).toBe(8);
  });
});

describe("DELETE /api/orden-de-compra/[id]", () => {
  it("debe eliminar una orden de compra y revertir el stock", async () => {
    const proveedor = await createProveedor();
    const stock = await createStock(proveedor.id, { units: 10 });

    const ordenDeCompra = await createOrdenDeCompra(proveedor.id, [
      { stockId: stock.id, cantidad: 5 },
    ]);
    const stockParcial = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockParcial?.units).toBe(15);

    const request = new NextRequest(
      `http://localhost:3000/api/orden-de-compra/${ordenDeCompra.id}`,
      {
        method: "DELETE",
      }
    );

    const params = { id: ordenDeCompra.id.toString() };
    const response = await DELETE(request, { params });

    expect(response.status).toBe(200);

    // Verificar que la orden de compra se haya eliminado
    const ordenEliminada = await prisma.ordenDeCompra.findUnique({
      where: { id: ordenDeCompra.id },
    });
    expect(ordenEliminada).toBeNull();

    // Verificar que el stock se haya revertido
    const stockActualizado = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockActualizado?.units).toBe(10); // 10 (original) + 5 (añadido) - 5 (revertido)
  });
});
