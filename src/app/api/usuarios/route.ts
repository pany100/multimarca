import { signupUser } from "@/lib/auth/signupUser";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET() {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      username: true,
      avatar: true,
      rol: true,
    },
  });
  return NextResponse.json(usuarios);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, username, rolId, email, password } = body;

    if (!fullName || !username || !rolId || !email || !password) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    if (
      typeof fullName !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof rolId !== "number"
    ) {
      return NextResponse.json(
        { error: "Tipo de datos incorrecto" },
        { status: 400 }
      );
    }
    const nuevoUsuario = await signupUser(body);
    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario" },
      { status: 400 }
    );
  }
}
