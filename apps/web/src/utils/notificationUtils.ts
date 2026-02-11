import prisma from "src/lib/prisma";

/**
 * Obtiene los usuarios que pueden recibir notificaciones (por id: 1, 5 o 6).
 * @returns Array de usuarios con id 1, 5 o 6
 */
export async function getUsersToNotify() {
  const users = await prisma.usuario.findMany({
    where: {
      id: { in: [1, 5, 6] },
    },
    include: {
      rol: true,
    },
  });

  return users;
}
