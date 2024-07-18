import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        rol: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener información del usuario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    const { fullName, username, email, rolId, avatar } = await request.json();
    const updatedUser = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        fullName: fullName,
        username: username,
        email: email,
        rol: {
          connect: { id: rolId },
        },
        avatar: avatar,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        rol: true,
        avatar: true,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener información del usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener el ID del usuario autenticado del encabezado
    const authUserId = request.headers.get("x-user-id");
    if (user.id === parseInt(authUserId || "0")) {
      return NextResponse.json(
        { error: "No puedes borrarte a ti mismo" },
        { status: 403 }
      );
    }
    // Verificar si el usuario autenticado tiene el rol de Administrador
    const authUser = await prisma.usuario.findUnique({
      where: { id: parseInt(authUserId || "0") },
      include: { rol: true },
    });

    if (!authUser || authUser.rol?.name !== "Administrador") {
      return NextResponse.json(
        { error: "Solo los administradores pueden eliminar usuarios" },
        { status: 403 }
      );
    }

    await prisma.usuario.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      msg: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el usuario" },
      { status: 500 }
    );
  }
}
