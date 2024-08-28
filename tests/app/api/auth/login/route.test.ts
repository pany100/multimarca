import { POST } from "@/app/api/auth/login/route";
import { loginUser } from "@/lib/auth/authService";
import { NextRequest } from "next/server";

// Mockear el módulo authService
jest.mock("@/lib/auth/authService", () => ({
  loginUser: jest.fn(),
}));

describe("POST /api/auth/login", () => {
  it("debería devolver un token y usuario cuando las credenciales son válidas", async () => {
    const mockToken = "mock-token";
    const mockUser = { id: 1, email: "test@example.com" };
    (loginUser as jest.Mock).mockResolvedValue({
      token: mockToken,
      user: mockUser,
    });

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      }
    );

    const response = await POST(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ token: mockToken, user: mockUser });
  });

  it("debería devolver un error 400 cuando faltan email o contraseña", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }), // Falta la contraseña
      }
    );

    const response = await POST(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({
      error: "Email y contraseña son requeridos",
    });
  });

  it("debería devolver un error 401 cuando las credenciales son inválidas", async () => {
    (loginUser as jest.Mock).mockRejectedValue(
      new Error("Credenciales inválidas")
    );

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      }
    );

    const response = await POST(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody).toEqual({ error: "Credenciales inválidas" });
  });
});
