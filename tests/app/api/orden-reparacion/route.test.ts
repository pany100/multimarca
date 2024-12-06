import { POST } from "@/app/api/orden-reparacion/route";
import prisma from "@/lib/prisma";
import { EstadoOrdenReparacion } from "@prisma/client";
import { NextRequest } from "next/server";
import {
  createAuto,
  createCliente,
  createMecanico,
  createProveedor,
  createStock,
} from "../../../factory";

describe("POST /api/orden-reparacion", () => {
  it("debe crear correctamente una orden de reparación", async () => {
    // Configurar el entorno de prueba
    const cliente = await createCliente();
    const auto = await createAuto(cliente.id);
    const mecanico = await createMecanico();
    const proveedor = await createProveedor();
    const stock = await createStock(proveedor.id, { units: 10 });

    const ordenReparacionData = {
      autoId: auto.id,
      fechaEntradaReparacion: new Date(),
      fechaSalidaReparacion: new Date(),
      kilometros: 50000,
      observacionesCliente: "Ruido en el motor",
      observacionesEntrada: "[]",
      observacionesSalida: "[]",
      estado: EstadoOrdenReparacion.Terminado,
      pdfPath: "/path/to/pdf",
      mecanicos: [{ id: mecanico.id }],
      repuestosUsados: [
        {
          stock: { id: stock.id },
          precioCompra: 100,
          precioVenta: 150,
          unidadesConsumidas: 1,
        },
      ],
      reparacionesDeTercero: [
        {
          nombre: "Alineación y balanceo",
          precioCompra: 200,
          precioVenta: 250,
          proveedor: { id: proveedor.id },
        },
      ],
      trabajosRealizados: [
        {
          manoDeObra: { name: "Cambio de aceite" },
          precioUnitario: 50,
          diasParaRecordatorio: 180,
        },
      ],
      manoDeObra: 300,
      descuento: 0,
    };

    // Crear la solicitud
    const request = new NextRequest(
      "http://localhost:3000/api/orden-reparacion",
      {
        method: "POST",
        body: JSON.stringify(ordenReparacionData),
      }
    );

    // Ejecutar la función POST
    const response = await POST(request);
    const responseData = await response.json();

    // Verificar la respuesta
    expect(response.status).toBe(201);
    expect(responseData).toHaveProperty("id");
    expect(responseData.autoId).toBe(auto.id);
    expect(responseData.estado).toBe(EstadoOrdenReparacion.Terminado);

    // Verificar que la orden de reparación se creó en la base de datos
    const ordenReparacionCreada = await prisma.ordenReparacion.findUnique({
      where: { id: responseData.id },
      include: {
        mecanicos: true,
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
      },
    });

    expect(ordenReparacionCreada).not.toBeNull();
    expect(ordenReparacionCreada?.mecanicos).toHaveLength(1);
    expect(ordenReparacionCreada?.repuestosUsados).toHaveLength(1);
    expect(ordenReparacionCreada?.reparacionesDeTercero).toHaveLength(1);
    expect(ordenReparacionCreada?.trabajosRealizados).toHaveLength(1);

    // Verificar repuestos usados
    const repuestoUsado = ordenReparacionCreada?.repuestosUsados[0];
    expect(repuestoUsado?.stockId).toBe(stock.id);
    expect(repuestoUsado?.precioCompra.toNumber()).toBe(100);
    expect(repuestoUsado?.precioVenta.toNumber()).toBe(150);
    expect(repuestoUsado?.unidadesConsumidas).toBe(1);

    // Verificar que el stock se actualizó correctamente
    const stockActualizado = await prisma.stock.findUnique({
      where: { id: stock.id },
    });
    expect(stockActualizado?.units).toBe(9);

    // Verificar reparaciones de terceros
    const reparacionTercero = ordenReparacionCreada?.reparacionesDeTercero[0];
    expect(reparacionTercero?.nombre).toBe("Alineación y balanceo");
    expect(reparacionTercero?.precioCompra.toNumber()).toBe(200);
    expect(reparacionTercero?.precioVenta.toNumber()).toBe(250);
    expect(reparacionTercero?.proveedorId).toBe(proveedor.id);

    // Verificar trabajos realizados
    const trabajoRealizado = ordenReparacionCreada?.trabajosRealizados[0];
    expect(trabajoRealizado?.descripcion).toBe("Cambio de aceite");
    expect(trabajoRealizado?.precioUnitario.toNumber()).toBe(50);
    expect(trabajoRealizado?.diasParaRecordatorio).toBe(180);
  });
});
