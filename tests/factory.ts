import prisma from "@/lib/prisma";
import { faker } from "@faker-js/faker";
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
