import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET() {
  const usuarios = await prisma.usuario.findMany();
  return NextResponse.json(usuarios);
}

export async function POST(request: Request) {
  const { email, fullName, username, password } = await request.json();
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      email,
      fullName,
      username,
      password,
    },
  });
  return NextResponse.json(nuevoUsuario, { status: 201 });
}
