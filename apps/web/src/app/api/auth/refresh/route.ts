import { verifyToken } from "@/lib/auth/authService";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token no proporcionado" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verificar que el token actual sea válido
    const payload = (await verifyToken(token)) as {
      userId: number;
      email: string;
    };

    if (!payload || !payload.userId || !payload.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Generar un nuevo token con expiración renovada
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET no está definido");
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const newToken = await new jose.SignJWT({
      userId: payload.userId,
      email: payload.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secretKey);

    return NextResponse.json({ token: newToken }, { status: 200 });
  } catch (error) {
    console.error("Error en refresh token:", error);
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
