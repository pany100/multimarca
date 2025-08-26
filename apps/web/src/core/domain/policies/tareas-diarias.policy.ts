export const canDeleteTask = (
  user: { id: number; rol?: { name?: string } },
  tarea: { usuarioId: number }
) => user.rol?.name === "Administrador" || tarea.usuarioId === user.id;

export function isAdmin(user: { rol?: { name?: string } } | null | undefined) {
  const name = user?.rol?.name;
  return name === "Administrador" || name === "Admin";
}

export function canManageTask(
  user: { id: number; rol?: { name?: string } },
  tarea: { usuarioId: number }
) {
  return isAdmin(user) || tarea.usuarioId === user.id;
}
