import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Obtener todos los clientes
    const clientes = await prisma.cliente.findMany();

    // Actualizar cada cliente con su nombre en mayúsculas
    const actualizaciones = await Promise.all(
      clientes.map((cliente) =>
        prisma.cliente.update({
          where: { id: cliente.id },
          data: { fullName: cliente.fullName.toUpperCase() },
        })
      )
    );

    console.log(
      `Se actualizaron ${actualizaciones.length} clientes exitosamente`
    );

    // Obtener todos los autos
    const autos = await prisma.auto.findMany();

    // Actualizar cada auto con sus campos en mayúsculas
    const actualizacionesAutos = await Promise.all(
      autos.map((auto) =>
        prisma.auto.update({
          where: { id: auto.id },
          data: {
            patent: auto.patent?.toUpperCase(),
            model: auto.model?.toUpperCase(),
            brand: auto.brand?.toUpperCase(),
            color: auto.color?.toUpperCase(),
            chassis_number: auto.chassis_number?.toUpperCase(),
            engine_number: auto.engine_number?.toUpperCase(),
          },
        })
      )
    );

    console.log(
      `Se actualizaron ${actualizacionesAutos.length} autos exitosamente`
    );

    // Obtener todos los usuarios
    const usuarios = await prisma.usuario.findMany();

    // Actualizar cada usuario con su nombre en mayúsculas
    const actualizacionesUsuarios = await Promise.all(
      usuarios.map((usuario) =>
        prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            fullName: usuario.fullName.toUpperCase(),
          },
        })
      )
    );

    console.log(
      `Se actualizaron ${actualizacionesUsuarios.length} usuarios exitosamente`
    );

    // Obtener todos los empleados
    const empleados = await prisma.empleado.findMany();

    // Actualizar cada empleado con sus campos en mayúsculas
    const actualizacionesEmpleados = await Promise.all(
      empleados.map((empleado) =>
        prisma.empleado.update({
          where: { id: empleado.id },
          data: {
            name: empleado.name.toUpperCase(),
          },
        })
      )
    );

    console.log(
      `Se actualizaron ${actualizacionesEmpleados.length} empleados exitosamente`
    );

    // Obtener todos los proveedores
    const proveedores = await prisma.proveedor.findMany();

    // Actualizar cada proveedor con sus campos en mayúsculas
    const actualizacionesProveedores = await Promise.all(
      proveedores.map((proveedor) =>
        prisma.proveedor.update({
          where: { id: proveedor.id },
          data: {
            name: proveedor.name.toUpperCase(),
          },
        })
      )
    );

    console.log(
      `Se actualizaron ${actualizacionesProveedores.length} proveedores exitosamente`
    );
  } catch (error) {
    console.error("Error al actualizar los clientes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
