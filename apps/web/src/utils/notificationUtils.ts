import prisma from "src/lib/prisma";

/**
 * Obtiene todos los usuarios que tienen el rol con ID 4
 * @returns Array de usuarios con el rol especificado
 */
export async function getUsersToNotify() {
  const users = await prisma.usuario.findMany({
    where: {
      OR: [{ rolId: 4 }, { rolId: 5 }],
    },
    include: {
      rol: true,
    },
  });

  return users;
}
