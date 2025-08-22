import { POST } from "@/app/api/orden-de-compra/route";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest } from "next/server";
import { createProveedor, createStock } from "../../../factory";

describe("POST /api/orden-de-compra", () => {
  it("debe crear una nueva orden de compra", async () => {
    const proveedor = await createProveedor();
    const stock = await createStock(proveedor.id, {
      units: 10,
    });

    const mockRequestBody = {
      fecha: "2023-06-15",
      precioTotal: 1000,
      proveedorId: proveedor.id,
      items: [
        {
          cantidad: 5,
          stockId: stock.id,
        },
      ],
    };

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/orden-de-compra",
      {
        method: "POST",
        body: JSON.stringify(mockRequestBody),
      }
    );

    const response = await POST(mockRequest);
    const responseData = await response.json();
    expect(response.status).toBe(201);
    expect(new Date(responseData.fecha).toLocaleDateString()).toBe(
      new Date(mockRequestBody.fecha).toLocaleDateString()
    );
    expect(responseData.precioTotal).toStrictEqual(
      new Decimal(mockRequestBody.precioTotal)
    );
    expect(responseData.proveedorId).toBe(mockRequestBody.proveedorId);
    expect(responseData.items).toHaveLength(1);
    expect(responseData.items[0].cantidad).toBe(
      mockRequestBody.items[0].cantidad
    );
    expect(responseData.items[0].stockId).toBe(
      mockRequestBody.items[0].stockId
    );

    // Verificar que la orden de compra se haya creado en la base de datos
    const createdOrdenDeCompra = await prisma.ordenDeCompra.findUnique({
      where: { id: responseData.id },
      include: { items: true },
    });

    expect(createdOrdenDeCompra).not.toBeNull();
    expect(createdOrdenDeCompra?.items).toHaveLength(1);

    // Verificar que el stock se haya actualizado
    const updatedStock = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(updatedStock?.units).toBe(
      (stock.units || 0) + mockRequestBody.items[0].cantidad
    );
  });
});
