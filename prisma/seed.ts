const { PrismaClient } = require("@prisma/client");
const fs = require("fs") as typeof import("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

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
      rolId: 6,
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

  console.log("Iniciando carga de clientes desde CSV...");

  const csvFilePath = path.resolve(__dirname, "../data/clients.csv");
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
  for (const record of records) {
    const existingCliente = await prismaClient.cliente.findFirst({
      where: {
        fullName: record.nombre_completo,
        phone: record.telefono,
      },
    });
    if (existingCliente) {
      continue;
    }
    await prismaClient.cliente.create({
      data: {
        phone: record.telefono === "" ? null : record.telefono,
        fullName: record.nombre_completo === "" ? null : record.nombre_completo,
        email: record.email === "" ? null : record.email,
        birthday: record.cumple === "" ? null : record.cumple,
        address: record.dirección === "" ? null : record.dirección,
        city: record.ciudad === "" ? null : record.ciudad,
        state: record.provincia === "" ? null : record.provincia,
        postal_code: record.codigo_postal === "" ? null : record.codigo_postal,
        tax_status: record.afip === "" ? null : record.afip,
        dni: record.dni === "" ? null : record.dni,
        can_receive_notifications: true,
      },
    });
  }

  console.log("Carga de clientes completada.");

  console.log("Iniciando carga de autos desde CSV...");

  const autosFilePath = path.resolve(__dirname, "../data/cars.csv");
  const content = fs.readFileSync(autosFilePath, { encoding: "utf-8" });

  const carRecords = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of carRecords) {
    let owner;
    if (record.duenio !== "") {
      const cliente = await prismaClient.cliente.findFirst({
        where: { fullName: record.duenio },
      });
      if (cliente) {
        owner = { connect: { id: cliente.id } };
      } else {
        console.log(
          `No se encontró el cliente ${record.duenio}. Continuando con el siguiente registro.`
        );
        continue;
      }
    }
    await prismaClient.auto.upsert({
      where: { patent: record.patente },
      update: {
        patent: record.patente === "" ? null : record.patente,
        brand: record.marca === "" ? null : record.marca,
        model: record.modelo === "" ? null : record.modelo,
        valves: record.valvulas === "" ? null : parseInt(record.valvulas),
        color: record.color === "" ? null : record.color,
        year: record.anio === "" ? null : parseInt(record.anio),
        kms: record.kilometros === "" ? null : parseInt(record.kilometros),
        owner: owner,
        chassis_number: record.chasis === "" ? null : record.chasis,
        engine_number: record.motor === "" ? null : record.motor,
        observations: record.observaciones === "" ? null : record.observaciones,
        transmission_type:
          record.transmision === "" ? null : record.transmision,
      },
      create: {
        patent: record.patente === "" ? null : record.patente,
        brand: record.marca === "" ? null : record.marca,
        model: record.modelo === "" ? null : record.modelo,
        valves: record.valvulas === "" ? null : parseInt(record.valvulas),
        color: record.color === "" ? null : record.color,
        year: record.anio === "" ? null : parseInt(record.anio),
        kms: record.kilometros === "" ? null : parseInt(record.kilometros),
        owner: owner,
        chassis_number: record.chasis === "" ? null : record.chasis,
        engine_number: record.motor === "" ? null : record.motor,
        observations: record.observaciones === "" ? null : record.observaciones,
        transmission_type:
          record.transmision === "" ? null : record.transmision,
      },
    });
  }
  console.log("Carga de Autos completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
