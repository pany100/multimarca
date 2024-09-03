import { DELETE } from "@/app/api/orden-reparacion/[id]/route";
import prisma from "@/lib/prisma";
import { EstadoOrdenReparacion } from "@prisma/client";
import { NextRequest } from "next/server";
import {
  createAuto,
  createCliente,
  createOrdenReparacion,
  createProveedor,
  createStock,
} from "tests/factory";

describe("DELETE /api/orden-reparacion/[id]", () => {
  it("debería eliminar la orden de reparación y restaurar el stock", async () => {
    // Configurar el entorno de prueba
    const proveedor = await createProveedor();
    const stock = await createStock(proveedor.id, { units: 10 });
    const cliente = await createCliente();
    const auto = await createAuto(cliente.id);
    const ordenReparacion = await createOrdenReparacion(auto.id, {
      estado: EstadoOrdenReparacion.Terminado,
      repuestosUsados: {
        create: [
          {
            stockId: stock.id,
            unidadesConsumidas: 2,
            precioCompra: 100,
            precioVenta: 150,
          },
        ],
      },
    });
    // Verificar el stock inicial
    const stockInicial = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockInicial?.units).toBe(8);

    const request = new NextRequest(
      `http://localhost:3000/api/orden-reparacion/${ordenReparacion.id}`,
      {
        method: "DELETE",
      }
    );

    const response = await DELETE(request, {
      params: { id: ordenReparacion.id.toString() },
    });
    const responseData = await response.json();

    // Verificar que la respuesta sea correcta
    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      mensaje: "Orden de reparación eliminada y stock restaurado",
    });

    // Verificar que la orden de reparación se haya eliminado
    const ordenEliminada = await prisma.ordenReparacion.findUnique({
      where: { id: ordenReparacion.id },
    });
    expect(ordenEliminada).toBeNull();

    // Verificar que el stock se haya restaurado
    const stockFinal = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockFinal?.units).toBe(10);
  });

  it("debería devolver un error 404 si la orden de reparación no existe", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/orden-reparacion/999999",
      {
        method: "DELETE",
      }
    );

    const response = await DELETE(request, { params: { id: "999999" } });
    const responseData = await response.json();

    // Verificar que la respuesta sea un error 404
    expect(response.status).toBe(404);
    expect(responseData).toEqual({
      error: "Orden de reparación no encontrada",
    });
  });
});
