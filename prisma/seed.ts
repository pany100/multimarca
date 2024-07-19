const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();

const permisos = [
  "Usuarios",
  "Roles",
  "Clientes",
  "Autos",
  "Notificaciones",
  "NotificacionesClientes",
  "Estadisticas",
  "Reparaciones",
  "Controles",
  "Trabajos",
  "Proveedores",
  "Stock",
  "PagosReparaciones",
  "Mecanicos",
  "GastosEmpleados",
  "Gastos",
  "CategoriaGasto",
  "RetirosDinero",
  "Inversiones",
  "Deposito",
  "Ingresos",
  "OrdenesCompra",
  "Ventas",
];

async function main() {
  console.log("Iniciando carga de permisos...");

  for (const permiso of permisos) {
    await prismaClient.permiso.upsert({
      where: { name: permiso },
      update: {},
      create: { name: permiso },
    });
  }
  console.log("Carga de permisos completada.");

  console.log("Iniciando carga de roles...");

  // Crear rol Administrador
  const todosLosPermisos = await prismaClient.permiso.findMany();
  await prismaClient.rol.upsert({
    where: { name: "Administrador" },
    update: {
      permisos: {
        connect: todosLosPermisos.map((permiso: { id: number }) => ({
          id: permiso.id,
        })),
      },
    },
    create: {
      name: "Administrador",
      permisos: {
        connect: todosLosPermisos.map((permiso: { id: number }) => ({
          id: permiso.id,
        })),
      },
    },
  });

  // Crear rol Editor
  const permisoUsuario = await prismaClient.permiso.findUnique({
    where: { name: "Usuarios" },
  });
  if (permisoUsuario) {
    await prismaClient.rol.upsert({
      where: { name: "Editor" },
      update: {
        permisos: {
          connect: { id: permisoUsuario.id },
        },
      },
      create: {
        name: "Editor",
        permisos: {
          connect: { id: permisoUsuario.id },
        },
      },
    });
  }
  console.log("Carga de roles completada.");

  console.log("Iniciando carga de usuarios...");

  const usuarios = [
    {
      fullName: "Admin",
      username: "Admin",
      email: "pany100@gmail.com",
      rolId: 1,
      avatar: "/images/avatars/1.png",
      password: "Probando01",
    },
    {
      fullName: "Lisandro Troglio",
      username: "Liso",
      email: "liso.troglio@gmail.com",
      rolId: 1,
      avatar: "/images/avatars/7.png",
      password: "7yXLuicGpE7FxQ",
    },
    {
      fullName: "Mariano Troglio",
      username: "Nano",
      email: "mot024@hotmail.com",
      rolId: 1,
      avatar: "/images/avatars/5.png",
      password: "Fvx2NfEZCg6tFz",
    },
    {
      fullName: "Gabriela Ateca",
      username: "Gaby",
      email: "gabriela.ateca@gmail.com",
      rolId: 2,
      avatar: "/images/avatars/2.png",
      password: "8nD3xZoKmu32zK",
    },
  ];

  for (const usuario of usuarios) {
    await prismaClient.usuario.upsert({
      where: { email: usuario.email },
      update: usuario,
      create: usuario,
    });
  }
  console.log("Carga de usuarios completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
