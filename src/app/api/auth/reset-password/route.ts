import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    const usuario = await prisma.usuario.findFirst({
      where: {
        reset_password_token: token,
        reset_password_token_expired: { gt: new Date() },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        {
          error: "Token de restablecimiento de contraseña inválido o expirado.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || "10")
    );
    console.log(hashedPassword);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_token_expired: null,
      },
    });

    return NextResponse.json({
      msg: "La contraseña se ha restablecido exitosamente.",
    });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "No se pudo restablecer la contraseña." },
      { status: 500 }
    );
  }
}
