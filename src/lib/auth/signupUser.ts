import prisma from "src/lib/prisma";
import bcrypt from "bcryptjs";

interface SignupData {
  email: string;
  fullName: string;
  username: string;
  password: string;
  avatar?: string;
  rolId: number; // Asumimos que el rol se identifica por un ID
}

export async function signupUser({
  email,
  fullName,
  username,
  password,
  avatar,
  rolId,
}: SignupData) {
  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS || "10")
    );

    // Crear el nuevo usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        fullName,
        username,
        password: hashedPassword,
        avatar,
        rol: {
          connect: { id: rolId },
        },
      },
      include: {
        rol: true,
      },
    });

    const { password: _, ...usuarioSinPassword } = nuevoUsuario;

    return usuarioSinPassword;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw new Error("No se pudo crear el usuario");
  }
}
