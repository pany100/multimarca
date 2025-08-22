import { GET } from "@/app/api/autos/route";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  auto: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

describe("GET /api/autos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debería devolver autos sin query", async () => {
    const mockAutos = [
      { id: 1, patent: "ABC123", brand: "Toyota", model: "Corolla" },
      { id: 2, patent: "DEF456", brand: "Honda", model: "Civic" },
    ];

    (prisma.auto.findMany as jest.Mock).mockResolvedValue(mockAutos);
    (prisma.auto.count as jest.Mock).mockResolvedValue(2);

    const mockRequest = {
      url: "http://localhost:3000/api/autos?page=1&size=10",
    };

    const response = await GET(mockRequest as any);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      items: mockAutos,
      total: 2,
      page: 1,
      size: 10,
      totalPages: 1,
    });
  });

  test("Debería devolver autos con query por patent", async () => {
    const mockAutos = [
      {
        id: 1,
        patent: "ABC123",
        brand: "Toyota",
        model: "Corolla",
        owner: { fullName: "Juan Pérez" },
      },
    ];

    (prisma.auto.findMany as jest.Mock).mockResolvedValue(mockAutos);
    (prisma.auto.count as jest.Mock).mockResolvedValue(1);

    const mockRequest = {
      url: "http://localhost:3000/api/autos?page=1&size=10&query=ABC123",
    };

    const response = await GET(mockRequest as any);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      items: mockAutos,
      total: 1,
      page: 1,
      size: 10,
      totalPages: 1,
    });
  });

  test("Debería devolver autos con query por owner", async () => {
    const mockAutos = [
      {
        id: 1,
        patent: "ABC123",
        brand: "Toyota",
        model: "Corolla",
        owner: { fullName: "Juan Pérez" },
      },
    ];

    (prisma.auto.findMany as jest.Mock).mockResolvedValue(mockAutos);
    (prisma.auto.count as jest.Mock).mockResolvedValue(1);

    const mockRequest = {
      url: "http://localhost:3000/api/autos?page=1&size=10&query=Juan",
    };

    const response = await GET(mockRequest as any);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      items: mockAutos,
      total: 1,
      page: 1,
      size: 10,
      totalPages: 1,
    });
  });
});
