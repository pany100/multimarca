import { PrismaClient as Cliente } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const prismaClient = new Cliente();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      password: "Probando01",
    },
    {
      fullName: "Lisandro Troglio",
      username: "Liso",
      email: "liso.troglio@gmail.com",
      rolId: 1,
      password: "7yXLuicGpE7FxQ",
    },
    {
      fullName: "Mariano Troglio",
      username: "Nano",
      email: "mot024@hotmail.com",
      rolId: 1,
      password: "Fvx2NfEZCg6tFz",
    },
    {
      fullName: "Gabriela Ateca",
      username: "Gaby",
      email: "gabriela.ateca@gmail.com",
      rolId: 2,
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
    if (owner) {
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
          observations:
            record.observaciones === "" ? null : record.observaciones,
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
          observations:
            record.observaciones === "" ? null : record.observaciones,
          transmission_type:
            record.transmision === "" ? null : record.transmision,
        },
      });
    }
  }
  console.log("Carga de Autos completada.");

  console.log("Iniciando carga de Mano de Obra...");
  const trabajosData = fs.readFileSync("data/works.csv", { encoding: "utf-8" });
  const trabajosRecords = parse(trabajosData, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of trabajosRecords) {
    await prismaClient.manoDeObra.upsert({
      where: { name: record.name },
      update: {
        name: record.name,
        sellPrice:
          record.sellPrice === "" ? null : parseFloat(record.sellPrice),
      },
      create: {
        name: record.name,
        sellPrice:
          record.sellPrice === "" ? null : parseFloat(record.sellPrice),
      },
    });
  }
  console.log("Carga de Mano de Obra completada.");

  console.log("Iniciando carga de Mecánicos...");
  const mecanicosData = fs.readFileSync("data/mechanics.csv", {
    encoding: "utf-8",
  });
  const mecanicosRecords = parse(mecanicosData, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of mecanicosRecords) {
    await prismaClient.empleado.upsert({
      where: { name: record.nombre },
      update: {
        name: record.nombre,
        dni: record.dni === "" ? null : record.dni,
        address: record.dirección === "" ? null : record.dirección,
        city: record.ciudad === "" ? null : record.ciudad,
        state: record.provincia === "" ? null : record.provincia,
        postal_code:
          record["codigo postal"] === "" ? null : record["codigo postal"],
        email: record.email === "" ? null : record.email,
        phone: record.teléfono === "" ? null : record.teléfono,
        birthday: record.cumpleaños === "" ? null : record.cumpleaños,
      },
      create: {
        name: record.nombre,
        dni: record.dni === "" ? null : record.dni,
        address: record.dirección === "" ? null : record.dirección,
        city: record.ciudad === "" ? null : record.ciudad,
        state: record.provincia === "" ? null : record.provincia,
        postal_code:
          record["codigo postal"] === "" ? null : record["codigo postal"],
        email: record.email === "" ? null : record.email,
        phone: record.teléfono === "" ? null : record.teléfono,
        birthday: record.cumpleaños === "" ? null : record.cumpleaños,
      },
    });
  }
  console.log("Carga de Mecánicos completada.");

  console.log("Iniciando carga de Proveedores...");
  const proveedoresData = fs.readFileSync("data/providers.csv", {
    encoding: "utf-8",
  });
  const proveedoresRecords = parse(proveedoresData, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of proveedoresRecords) {
    await prismaClient.proveedor.upsert({
      where: { name: record.nombre },
      update: {
        name: record.nombre,
        address: record.dirección === "" ? null : record.dirección,
        email: record.email === "" ? null : record.email,
        phone: record.teléfono === "" ? null : record.teléfono,
        mobile: record.celular === "" ? null : record.celular,
        iva: record.iva === "" ? null : record.iva,
        cuit: record.CUIT === "" ? null : record.CUIT,
      },
      create: {
        name: record.nombre,
        address: record.dirección === "" ? null : record.dirección,
        email: record.email === "" ? null : record.email,
        phone: record.teléfono === "" ? null : record.teléfono,
        mobile: record.celular === "" ? null : record.celular,
        iva: record.iva === "" ? null : record.iva,
        cuit: record.CUIT === "" ? null : record.CUIT,
      },
    });
  }
  console.log("Carga de Proveedores completada.");

  console.log("Iniciando carga de Categorías de Gasto...");
  const categoriasGasto = [
    "Pago Proveedores",
    "Pago Mecánicos",
    "Pago General",
  ];

  for (const categoria of categoriasGasto) {
    await prismaClient.categoriaGasto.upsert({
      where: { nombre: categoria },
      update: {},
      create: { nombre: categoria },
    });
  }
  console.log("Carga de Categorías de Gasto completada.");

  console.log("Iniciando carga de datos de Dólar...");
  const dolarData = fs.readFileSync("data/dolar.csv", {
    encoding: "utf-8",
  });
  const dolarRecords = parse(dolarData, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of dolarRecords) {
    await prismaClient.dolar.upsert({
      where: { fecha: new Date(record.fecha) },
      update: {
        oficial: parseFloat(record.oficial),
        blue: parseFloat(record.blue),
      },
      create: {
        fecha: new Date(record.fecha),
        oficial: parseFloat(record.oficial),
        blue: parseFloat(record.blue),
      },
    });
  }
  console.log("Carga de datos de Dólar completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
