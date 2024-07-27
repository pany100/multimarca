import bcrypt from "bcryptjs";
import prisma from "src/lib/prisma";

interface SignupData {
  email: string;
  fullName: string;
  username: string;
  password: string;
  rolId: number; // Asumimos que el rol se identifica por un ID
}

export async function signupUser({
  email,
  fullName,
  username,
  password,
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
