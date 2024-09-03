import prisma from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import { EstadoOrdenReparacion } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export async function createProveedor(overrides = {}) {
  return prisma.proveedor.create({
    data: {
      name: faker.company.name(),
      ...overrides,
    },
  });
}

export async function createStock(proveedorId: number, overrides = {}) {
  return prisma.stock.create({
    data: {
      name: faker.commerce.productName(),
      brand: faker.company.name(),
      buyPrice: faker.number.int({ min: 100, max: 1000 }),
      proveedorId,
      ...overrides,
    },
  });
}

export async function createCliente(overrides = {}) {
  return prisma.cliente.create({
    data: {
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.helpers.fromRegExp(/[0-9]{10}/),
      ...overrides,
    },
  });
}

export async function createOrdenDeCompra(
  proveedorId: number,
  items: { stockId: number; cantidad: number }[],
  overrides = {}
) {
  const ordenDeCompra = await prisma.ordenDeCompra.create({
    data: {
      fecha: faker.date.recent(),
      precioTotal: faker.number.float({
        min: 1000,
        max: 10000,
        multipleOf: 2,
      }),
      proveedorId,
      ...overrides,
    },
  });

  for (const item of items) {
    await prisma.ordenDeCompraItem.create({
      data: {
        cantidad: item.cantidad,
        stockId: item.stockId,
        ordenDeCompraId: ordenDeCompra.id,
      },
    });

    await prisma.stock.update({
      where: { id: item.stockId },
      data: {
        units: {
          increment: item.cantidad,
        },
      },
    });
  }

  return ordenDeCompra;
}

export async function createVenta(
  clienteId: number | null,
  precioTotal: number,
  items: { stockId: number; cantidad: number }[],
  overrides = {}
) {
  let total = new Decimal(precioTotal);

  const venta = await prisma.venta.create({
    data: {
      fecha: faker.date.recent(),
      clienteId,
      total,
      ...overrides,
    },
  });

  // Crear los items de la venta y actualizar el stock
  for (const item of items) {
    await prisma.ventaItem.create({
      data: {
        ventaId: venta.id,
        stockId: item.stockId,
        cantidad: item.cantidad,
      },
    });

    await prisma.stock.update({
      where: { id: item.stockId },
      data: {
        units: {
          decrement: item.cantidad,
        },
      },
    });
  }

  return venta;
}

export async function createAuto(ownerId: number, overrides = {}) {
  return await prisma.auto.create({
    data: {
      patent: faker.vehicle.vrm(),
      model: faker.vehicle.model(),
      brand: faker.vehicle.manufacturer(),
      color: faker.color.human(),
      year: faker.date.past().getFullYear(),
      kms: faker.number.int({ min: 0, max: 200000 }),
      valves: faker.number.int({ min: 8, max: 32 }),
      ownerId,
      chassis_number: faker.string.alphanumeric(17),
      engine_number: faker.string.alphanumeric(10),
      observations: faker.lorem.sentence(),
      transmission_type: faker.helpers.arrayElement(["Manual", "Automático"]),
      ...overrides,
    },
  });
}

export async function createMecanico(overrides = {}) {
  return await prisma.empleado.create({
    data: {
      name: faker.person.fullName(),
      tipo: "Mecanico",
      start_date: faker.date.past(),
      dni: faker.string.numeric(8),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postal_code: faker.location.zipCode(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      birthday: faker.date.birthdate(),
      ...overrides,
    },
  });
}

export async function createOrdenReparacion(
  autoId: number,
  overrides: {
    estado?: EstadoOrdenReparacion;
    repuestosUsados?: { create?: any[] };
  } = {}
) {
  const data = {
    autoId,
    fechaCreacion: faker.date.recent(),
    fechaEntradaReparacion: faker.date.recent(),
    fechaSalidaReparacion: faker.date.future(),
    kilometros: faker.number.int({ min: 0, max: 200000 }),
    observacionesCliente: faker.lorem.paragraph(),
    observacionesEntrada: faker.lorem.paragraph(),
    observacionesSalida: faker.lorem.paragraph(),
    estado: faker.helpers.arrayElement([
      "Presupuestado",
      "EnProgreso",
      "Aceptado",
      "Terminado",
    ]),
    pdfPath: faker.system.filePath(),
    manoDeObra: faker.number.float({ min: 100, max: 1000, multipleOf: 0.01 }),
    ...overrides,
  };

  const ordenReparacion = await prisma.ordenReparacion.create({
    data: {
      ...data,
      estado: data.estado as EstadoOrdenReparacion,
    },
  });

  if ("repuestosUsados" in overrides && overrides.repuestosUsados?.create) {
    const repuestos = overrides.repuestosUsados.create;
    for (const repuesto of repuestos) {
      await prisma.stock.update({
        where: { id: repuesto.stockId },
        data: { units: { decrement: repuesto.unidadesConsumidas } },
      });
    }
  }

  return ordenReparacion;
}
