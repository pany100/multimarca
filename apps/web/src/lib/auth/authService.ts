import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as jose from "jose";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

export async function loginUser(email: string, password: string) {
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar si el usuario está activo
  if (!user.activo) {
    throw new Error("Usuario desactivado");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Contraseña incorrecta");
  }
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definido");
  }
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  const token = await new jose.SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);

  return {
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

export async function verifyToken(token: string) {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET no está definido");
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    throw error;
  }
}

import { cookies } from "next/headers";

export async function getSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token.value);

    if (!payload) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch (error) {
    console.error("Error al obtener la sesión:", error);
    return null;
  }
}
