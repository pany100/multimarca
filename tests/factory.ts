import prisma from "@/lib/prisma";
import { faker } from "@faker-js/faker";

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
