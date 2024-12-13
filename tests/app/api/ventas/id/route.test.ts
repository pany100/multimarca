import { DELETE, PUT } from "@/app/api/ventas/[id]/route";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest } from "next/server";
import {
  createCliente,
  createProveedor,
  createStock,
  createVenta,
} from "../../../../factory";

describe("DELETE /api/ventas/[id]", () => {
  it("debe eliminar correctamente una venta y actualizar el stock", async () => {
    // Configurar el entorno de prueba
    const proveedor = await createProveedor();
    const stock = await createStock(proveedor.id, { units: 10 });
    const cliente = await createCliente();

    // Crear una venta
    const venta = await createVenta(cliente.id, 100, [
      { stockId: stock.id, cantidad: 3 },
    ]);

    // Verificar que el stock se actualizó después de la venta
    const stockDespuesVenta = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockDespuesVenta?.units).toBe(7);

    // Crear la solicitud de eliminación
    const request = new NextRequest(
      `http://localhost:3000/api/ventas/${venta.id}`,
      {
        method: "DELETE",
      }
    );

    // Ejecutar la función DELETE
    await DELETE(request, { params: { id: venta.id.toString() } });

    // Verificar que la venta se eliminó
    const ventaEliminada = await prisma.venta.findUnique({
      where: { id: venta.id },
    });
    expect(ventaEliminada).toBeNull();

    // Verificar que el stock se actualizó correctamente después de eliminar la venta
    const stockDespuesEliminar = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockDespuesEliminar?.units).toBe(10);
  });
});

describe("PUT /api/ventas/[id]", () => {
  it("debe actualizar correctamente una venta y ajustar el stock", async () => {
    // Configurar el entorno de prueba
    const proveedor = await createProveedor();
    const stock1 = await createStock(proveedor.id, { units: 10 });
    const stock2 = await createStock(proveedor.id, { units: 15 });
    const cliente = await createCliente();

    // Crear una venta inicial
    const ventaInicial = await createVenta(cliente.id, 100, [
      { stockId: stock1.id, cantidad: 3 },
    ]);

    // Verificar que el stock1 se actualizó después de la venta inicial
    const stock1DespuesVentaInicial = await prisma.stock.findUnique({
      where: { id: stock1.id },
    });
    expect(stock1DespuesVentaInicial?.units).toBe(7);

    // Preparar los datos para la actualización
    const datosActualizados = {
      clienteId: cliente.id,
      items: [{ stockId: stock2.id, cantidad: 5 }],
      total: 150,
      moneda: "Peso",
      fecha: new Date(),
    };

    // Crear la solicitud de actualización
    const request = new NextRequest(
      `http://localhost:3000/api/ventas/${ventaInicial.id}`,
      {
        method: "PUT",
        body: JSON.stringify(datosActualizados),
      }
    );

    // Ejecutar la función PUT
    await PUT(request, { params: { id: ventaInicial.id.toString() } });

    // Verificar que la venta se actualizó correctamente
    const ventaActualizada = await prisma.venta.findUnique({
      where: { id: ventaInicial.id },
      include: { items: true },
    });
    expect(ventaActualizada).not.toBeNull();
    expect(ventaActualizada?.total).toStrictEqual(new Decimal(150));
    expect(ventaActualizada?.items).toHaveLength(1);
    expect(ventaActualizada?.items[0].stockId).toBe(stock2.id);
    expect(ventaActualizada?.items[0].cantidad).toBe(5);

    // Verificar que el stock1 se restauró correctamente
    const stock1DespuesActualizar = await prisma.stock.findUnique({
      where: { id: stock1.id },
    });
    expect(stock1DespuesActualizar?.units).toBe(10);

    // Verificar que el stock2 se actualizó correctamente
    const stock2DespuesActualizar = await prisma.stock.findUnique({
      where: { id: stock2.id },
    });
    expect(stock2DespuesActualizar?.units).toBe(10);
  });
});
