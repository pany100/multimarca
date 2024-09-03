import { POST } from "@/app/api/ventas/route";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { createCliente, createProveedor, createStock } from "../../../factory";

describe("POST /api/ventas", () => {
  it("debe actualizar correctamente las unidades del stock después de una venta", async () => {
    // Configurar el entorno de prueba
    const proveedor = await createProveedor();
    const stock = await createStock(proveedor.id, { units: 10 });
    const cliente = await createCliente();

    const stockIntermedio = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockIntermedio?.units).toBe(10);

    // Crear la solicitud
    const request = new NextRequest("http://localhost:3000/api/ventas", {
      method: "POST",
      body: JSON.stringify({
        clienteId: cliente.id,
        items: [{ stockId: stock.id, cantidad: 3 }],
        total: 100,
        fecha: new Date(),
      }),
    });

    // Ejecutar la función POST
    await POST(request);

    // Verificar que el stock se actualizó correctamente
    const stockActualizado = await prisma.stock.findUnique({
      where: { id: stock.id },
    });

    expect(stockActualizado?.units).toBe(7);
  });
});
