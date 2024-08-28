import { POST } from "@/app/api/auth/reset-password/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

jest.mock("@/lib/prisma", () => ({
  usuario: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debería devolver un error si el usuario no existe", async () => {
    const mockRequest = {
      json: jest
        .fn()
        .mockResolvedValue({
          token: "token123",
          newPassword: "nuevaContraseña123",
        }),
    };

    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(null);

    const response = await POST(mockRequest as any);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({
      error: "Token de restablecimiento de contraseña inválido o expirado.",
    });
  });

  test("Debería actualizar la contraseña si el usuario existe", async () => {
    const mockRequest = {
      json: jest
        .fn()
        .mockResolvedValue({
          token: "token123",
          newPassword: "nuevaContraseña123",
        }),
    };

    const mockUsuario = {
      id: 1,
      reset_password_token: "token123",
      reset_password_token_expired: new Date(Date.now() + 3600000),
    };

    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(mockUsuario);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

    const response = await POST(mockRequest as any);
    const responseBody = await response.json();

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: mockUsuario.id },
      data: {
        password: "hashedPassword123",
        reset_password_token: null,
        reset_password_token_expired: null,
      },
    });

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      msg: "La contraseña se ha restablecido exitosamente.",
    });
  });
});
