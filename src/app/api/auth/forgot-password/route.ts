import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { sendEmail } from "@/lib/email"; // Asume que tienes una función para enviar emails

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return NextResponse.json(
        { error: "El correo electrónico proporcionado no está registrado." },
        { status: 404 }
      );
    }

    const resetPasswordToken = randomBytes(16).toString("hex");
    const resetPasswordTokenExpired = addHours(new Date(), 24);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        reset_password_token: resetPasswordToken,
        reset_password_token_expired: resetPasswordTokenExpired,
      },
    });
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

    const resetPasswordUrl = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;

    await sendEmail({
      to: email,
      subject: "Restablecer contraseña de la aplicación",
      text: `Haga clic en el siguiente enlace para restablecer su contraseña: ${resetPasswordUrl}`,
    });

    return NextResponse.json({
      msg: "Se ha enviado un correo electrónico con las instrucciones para restablecer la contraseña.",
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      {
        error:
          "No se pudo procesar la solicitud de restablecimiento de contraseña.",
      },
      { status: 500 }
    );
  }
}
