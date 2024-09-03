const { config } = require("dotenv");
const { resolve } = require("path");
const { PrismaClient } = require("@prisma/client");

const result = config({
  path: resolve(process.cwd(), ".env.test"),
  override: true,
});

Object.assign(process.env, result.parsed);

const prisma = new PrismaClient();

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: () => Promise.resolve(body),
      status: init?.status || 200,
    })),
  },
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    ...init,
    json: () => Promise.resolve(init.body ? JSON.parse(init.body) : {}),
  })),
}));

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  // Lista de todos los modelos en tu schema de Prisma
  const models = [
    "ordenReparacion",
    "auto",
    "cliente",
    "empleado",
    "ventaItem",
    "venta",
    "ordenDeCompra",
    "stock",
    "proveedor",
    // Agrega aquí todos los demás modelos de tu schema
  ];

  // Elimina todos los registros de cada modelo
  for (const model of models) {
    if (prisma[model] && typeof prisma[model].deleteMany === "function") {
      await prisma[model].deleteMany();
    } else {
      console.warn(`Model ${model} not found or deleteMany is not a function`);
    }
  }
});
