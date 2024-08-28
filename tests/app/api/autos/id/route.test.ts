import { DELETE, PUT } from "@/app/api/autos/[id]/route";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  auto: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("PUT /api/autos/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debería actualizar un auto exitosamente", async () => {
    const autoOriginal = {
      id: 1,
      patent: "ABC123",
      brand: "Toyota",
      model: "Corolla",
      owner: { fullName: "Juan Pérez" },
    };

    const autoActualizado = {
      ...autoOriginal,
      patent: "XYZ789",
      brand: "Honda",
      model: "Civic",
    };

    (prisma.auto.update as jest.Mock).mockImplementation((args) => {
      expect(args.where.id).toBe(1);
      expect(args.data).toEqual(
        expect.objectContaining({
          patent: "XYZ789",
          brand: "Honda",
          model: "Civic",
        })
      );
      return Promise.resolve(autoActualizado);
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        patent: "XYZ789",
        brand: "Honda",
        model: "Civic",
      }),
    };

    const mockParams = { id: "1" };

    const response = await PUT(mockRequest as any, { params: mockParams });
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(autoActualizado);
    expect(prisma.auto.update).toHaveBeenCalledTimes(1);
    expect(prisma.auto.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        patent: "XYZ789",
        brand: "Honda",
        model: "Civic",
      }),
      include: { owner: true },
    });
  });
});

describe("DELETE /api/autos/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debería eliminar un auto exitosamente", async () => {
    const mockDeletedAuto = { id: 1, patent: "ABC123" };

    (prisma.auto.delete as jest.Mock).mockResolvedValue(mockDeletedAuto);

    const mockParams = { id: "1" };

    const response = await DELETE({} as Request, { params: mockParams });
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ message: "Auto eliminado con éxito" });
    expect(prisma.auto.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  test("Debería devolver un error si el auto no existe", async () => {
    (prisma.auto.delete as jest.Mock).mockRejectedValue(
      new Error("Auto no encontrado")
    );

    const mockParams = { id: "999" };

    const response = await DELETE({} as Request, { params: mockParams });
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: "Error al eliminar el auto" });
  });
});
