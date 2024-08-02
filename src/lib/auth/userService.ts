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

interface UpdateData extends SignupData {
  id: number;
}

export async function updateUser({
  id,
  email,
  fullName,
  username,
  password,
  rolId,
}: UpdateData) {
  try {
    const dataToUpdate: any = {
      email,
      fullName,
      username,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.SALT_ROUNDS || "10")
      );
      dataToUpdate.password = hashedPassword;
    }

    if (rolId) {
      dataToUpdate.rol = {
        connect: { id: rolId },
      };
    }

    const updatedUser = await prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      include: {
        rol: true,
      },
    });

    const { password: _, ...usuarioSinPassword } = updatedUser;

    return usuarioSinPassword;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw new Error("No se pudo actualizar el usuario");
  }
}
