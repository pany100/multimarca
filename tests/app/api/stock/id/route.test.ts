import { PUT } from "@/app/api/stock/[id]/route";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest } from "next/server";
import { createProveedor, createStock } from "tests/factory";

describe("PUT /api/stock/[id]", () => {
  it("debería actualizar correctamente el stock", async () => {
    const proveedor = await createProveedor();

    const stockOriginal = await createStock(proveedor.id, {
      name: "Producto Original",
      brand: "Marca Original",
      buyPrice: 100,
      units: 50,
      restockValue: 10,
      label: "Etiqueta Original",
      markup: 1.5,
    });

    const datosActualizados = {
      name: "Producto Actualizado",
      brand: "Marca Actualizada",
      buyPrice: 150,
      units: 75,
      restockValue: "15",
      label: "Etiqueta Actualizada",
      markup: "2.0",
      proveedorId: proveedor.id,
    };

    const request = new NextRequest(
      `http://localhost:3000/api/stock/${stockOriginal.id}`,
      {
        method: "PUT",
        body: JSON.stringify(datosActualizados),
      }
    );

    const params = { id: stockOriginal.id.toString() };
    const response = await PUT(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);

    // Verificar que los datos se actualizaron correctamente
    const stockActualizado = await prisma.stock.findUnique({
      where: { id: stockOriginal.id },
      include: { proveedor: true },
    });
    expect(stockActualizado).toMatchObject({
      id: stockOriginal.id,
      name: datosActualizados.name,
      brand: datosActualizados.brand,
      buyPrice: new Decimal(datosActualizados.buyPrice),
      units: datosActualizados.units,
      restockValue: parseInt(datosActualizados.restockValue),
      label: datosActualizados.label,
      markup: parseFloat(datosActualizados.markup),
      proveedorId: proveedor.id,
    });
    expect(data).toEqual(stockActualizado);
  });

  it("debería devolver un error 400 si faltan datos requeridos", async () => {
    const proveedor = await createProveedor();

    const stockOriginal = await createStock(proveedor.id);

    const request = new NextRequest(
      `http://localhost:3000/api/stock/${stockOriginal.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          buyPrice: 100,
          units: 50,
        }),
      }
    );

    const params = { id: stockOriginal.id.toString() };
    const response = await PUT(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Nombre o marca del stock inválido o faltante");
  });

  it("debería manejar errores internos", async () => {
    const proveedor = await createProveedor();

    const stockOriginal = await createStock(proveedor.id);

    // Simular un error en la base de datos
    jest
      .spyOn(prisma.stock, "update")
      .mockRejectedValueOnce(new Error("Error de base de datos"));

    const request = new NextRequest(
      `http://localhost:3000/api/stock/${stockOriginal.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: "Producto",
          brand: "Marca",
          buyPrice: 100,
          units: 50,
        }),
      }
    );

    const params = { id: stockOriginal.id.toString() };
    const response = await PUT(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Error al actualizar el stock");

    // Restaurar el mock
    jest.restoreAllMocks();
  });
});
