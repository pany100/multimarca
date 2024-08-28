import { POST } from "@/app/api/auth/forgot-password/route";
import { sendEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mockear los módulos necesarios
jest.mock("@/lib/prisma", () => ({
  usuario: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn(),
}));

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería devolver un error 404 cuando el usuario no existe", async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email: "noexiste@example.com" }),
      }
    );

    const response = await POST(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody).toEqual({
      error: "El correo electrónico proporcionado no está registrado.",
    });
  });

  it("debería enviar un correo electrónico cuando el usuario existe", async () => {
    const mockUser = { id: 1, email: "existe@example.com" };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.usuario.update as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email: "existe@example.com" }),
      }
    );

    const response = await POST(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      msg: "Se ha enviado un correo electrónico con las instrucciones para restablecer la contraseña.",
    });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "existe@example.com",
        subject: "Restablecer contraseña de la aplicación",
      })
    );
  });
});
