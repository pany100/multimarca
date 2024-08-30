import { POST } from "@/app/api/stock/update-by-provider/route";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { createProveedor, createStock } from "tests/factory";

describe("POST /api/stock/update-by-provider", () => {
  it("debería devolver un error si faltan provider id", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/stock/update-by-provider",
      {
        method: "POST",
        body: JSON.stringify({ porcentajeAumento: 10 }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Faltan datos requeridos");
  });

  it("debería devolver un error si faltan porcentajeAumento", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/stock/update-by-provider",
      {
        method: "POST",
        body: JSON.stringify({ providerId: 1 }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Faltan datos requeridos");
  });

  it("debería actualizar correctamente los precios de compra del stock de un proveedor", async () => {
    // Crear un proveedor de prueba
    const proveedor = await createProveedor();

    // Crear elementos de stock para el proveedor
    const stockItems = await Promise.all([
      createStock(proveedor.id, { buyPrice: 100 }),
      createStock(proveedor.id, { buyPrice: 200 }),
      createStock(proveedor.id, { buyPrice: 300 }),
    ]);

    const porcentajeAumento = 10;
    const request = new NextRequest(
      "http://localhost:3000/api/stock/update-by-provider",
      {
        method: "POST",
        body: JSON.stringify({ proveedorId: proveedor.id, porcentajeAumento }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Precios actualizados con éxito");

    for (const item of stockItems) {
      const updatedItem = await prisma.stock.findUnique({
        where: { id: item.id },
      });
      const expectedPrice = Math.round(Number(item.buyPrice) * 1.1);
      expect(Math.round(Number(updatedItem?.buyPrice || 0))).toBe(
        expectedPrice
      );
    }
  });
});
