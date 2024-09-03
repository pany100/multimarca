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

  it("debería actualizar correctamente los precios de compra del stock solo del proveedor especificado", async () => {
    // Crear dos proveedores de prueba
    const proveedor1 = await createProveedor();
    const proveedor2 = await createProveedor();

    // Crear elementos de stock para ambos proveedores
    const stockItemsProveedor1 = await Promise.all([
      createStock(proveedor1.id, { buyPrice: 100 }),
      createStock(proveedor1.id, { buyPrice: 200 }),
    ]);

    const stockItemsProveedor2 = await Promise.all([
      createStock(proveedor2.id, { buyPrice: 300 }),
      createStock(proveedor2.id, { buyPrice: 400 }),
    ]);

    const porcentajeAumento = 10;
    const request = new NextRequest(
      "http://localhost:3000/api/stock/update-by-provider",
      {
        method: "POST",
        body: JSON.stringify({ proveedorId: proveedor1.id, porcentajeAumento }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Precios actualizados con éxito");

    // Verificar que los precios del proveedor1 se actualizaron
    for (const item of stockItemsProveedor1) {
      const updatedItem = await prisma.stock.findUnique({
        where: { id: item.id },
      });
      const expectedPrice = Math.round(Number(item.buyPrice) * 1.1);
      expect(Math.round(Number(updatedItem?.buyPrice || 0))).toBe(
        expectedPrice
      );
    }

    // Verificar que los precios del proveedor2 no cambiaron
    for (const item of stockItemsProveedor2) {
      const unchangedItem = await prisma.stock.findUnique({
        where: { id: item.id },
      });
      expect(Number(unchangedItem?.buyPrice)).toBe(Number(item.buyPrice));
    }
  });
});
