const { Faker, es, en } = require("@faker-js/faker");
const { PrismaClient } = require("@prisma/client");

const generateTestPrisma = new PrismaClient();
const fakerES = new Faker({ locale: [es, en] });

function calcularTotalRepuestos(ordenReparacion: {
  repuestosUsados: {
    precioVenta: number;
    unidadesConsumidas: number;
  }[];
}): number {
  return ordenReparacion.repuestosUsados.reduce(
    (total, repuesto) => total + parseFloat(repuesto.precioVenta.toString()),
    0
  );
}

function calcularTotalReparacionesTerceros(ordenReparacion: {
  reparacionesDeTercero: { precioVenta: number }[];
}): number {
  return ordenReparacion.reparacionesDeTercero.reduce(
    (total, reparacion) =>
      total + parseFloat(reparacion.precioVenta.toString()),
    0
  );
}

function calcularTotalOrdenReparacion(ordenReparacion: {
  repuestosUsados: { precioVenta: number; unidadesConsumidas: number }[];
  reparacionesDeTercero: { precioVenta: number }[];
  manoDeObra: number;
}): number {
  const totalRepuestos = calcularTotalRepuestos(ordenReparacion);

  const totalReparacionesTerceros =
    calcularTotalReparacionesTerceros(ordenReparacion);
  // 3. Mano de obra
  const manoDeObra = parseFloat(ordenReparacion.manoDeObra.toString());

  return totalRepuestos + totalReparacionesTerceros + manoDeObra;
}

async function generateStockData(tx: any, stockCount: number) {
  const proveedores = await tx.proveedor.findMany();

  for (let i = 0; i < stockCount; i++) {
    const randomProveedor =
      proveedores[Math.floor(Math.random() * proveedores.length)];

    await tx.stock.create({
      data: {
        name: fakerES.commerce.productName(),
        brand: fakerES.company.name(),
        buyPrice: parseFloat(fakerES.commerce.price({ min: 10, max: 1000 })),
        units: fakerES.number.int({ min: 1, max: 100 }),
        restockValue: fakerES.number.int({ min: 5, max: 50 }),
        label: fakerES.commerce.productAdjective(),
        markup: fakerES.number.int({ min: 5, max: 50 }),
        proveedorId: randomProveedor.id,
      },
    });
  }

  console.log(`Se generaron ${stockCount} elementos de stock de prueba.`);
}

async function generateOrdenesDeCompra(tx: any, ordenesCount: number) {
  const proveedores = await tx.proveedor.findMany({
    include: {
      stocks: true,
    },
  });

  for (let i = 0; i < ordenesCount; i++) {
    const randomProveedor =
      proveedores[Math.floor(Math.random() * proveedores.length)];

    if (randomProveedor.stocks.length === 0) {
      continue;
    }

    const itemsCount = Math.min(
      Math.floor(Math.random() * 7) + 1,
      randomProveedor.stocks.length
    );
    const items = [];
    let precioTotal = 0;

    for (let j = 0; j < itemsCount; j++) {
      const randomStock =
        randomProveedor.stocks[
          Math.floor(Math.random() * randomProveedor.stocks.length)
        ];
      const cantidad = Math.floor(Math.random() * 100) + 1;
      const itemPrecio = parseFloat(
        (randomStock.buyPrice * cantidad).toFixed(2)
      );
      precioTotal += itemPrecio;

      items.push({
        cantidad: cantidad,
        stockId: randomStock.id,
      });
    }

    // Ajustar el precio total si es necesario
    precioTotal = Math.max(30000, Math.min(precioTotal, 2000000));

    await tx.ordenDeCompra.create({
      data: {
        fecha: fakerES.date.recent(),
        precioTotal: precioTotal,
        proveedorId: randomProveedor.id,
        items: {
          create: items,
        },
      },
    });
  }

  console.log(`Se generaron ${ordenesCount} órdenes de compra de prueba.`);
}

async function generateOrdenesDeReparacion(tx: any, ordenesCount: number) {
  console.log(`Generando ${ordenesCount} órdenes de reparación de prueba...`);

  const autos = await tx.auto.findMany();
  const mecanicos = await tx.mecanico.findMany();
  const stocks = await tx.stock.findMany();
  const proveedores = await tx.proveedor.findMany();

  for (let i = 0; i < ordenesCount; i++) {
    const auto = fakerES.helpers.arrayElement(autos);
    const fechaEntrada = fakerES.date.past();
    const fechaSalida = fakerES.date.between({
      from: fechaEntrada,
      to: new Date(),
    });
    const estado =
      i < 50
        ? "Terminado"
        : fakerES.helpers.arrayElement([
            "Aceptado",
            "EnProgreso",
            "Presupuestado",
          ]);
    const manoDeObra = fakerES.number.float({
      min: 40000,
      max: 1000000,
      multipleOf: 0.01,
    });

    const ordenData = {
      autoId: auto.id,
      fechaCreacion: fakerES.date.recent(),
      fechaEntradaReparacion: fechaEntrada,
      fechaSalidaReparacion: estado === "Terminado" ? fechaSalida : null,
      kilometros: fakerES.number.int({ min: 0, max: 300000 }),
      observacionesCliente: fakerES.lorem.sentence(),
      observacionesEntrada: JSON.stringify([
        fakerES.lorem.paragraph(),
        fakerES.lorem.paragraph(),
        fakerES.lorem.paragraph(),
      ]),
      observacionesSalida:
        estado === "Terminado"
          ? JSON.stringify([
              fakerES.lorem.paragraph(),
              fakerES.lorem.paragraph(),
              fakerES.lorem.paragraph(),
            ])
          : "",
      estado: estado,
      manoDeObra: manoDeObra,
      mecanicos: {
        connect: fakerES.helpers
          .arrayElements(mecanicos, { min: 1, max: 3 })
          .map((m: any) => ({ id: m.id })),
      },
      repuestosUsados: {
        create: fakerES.datatype.boolean()
          ? fakerES.helpers
              .arrayElements(stocks, { min: 1, max: 5 })
              .map((stock: any) => ({
                stockId: stock.id,
                precioCompra: parseFloat(stock.buyPrice),
                precioVenta: parseFloat(stock.buyPrice) * 1.3,
                unidadesConsumidas: fakerES.number.int({ min: 1, max: 5 }),
              }))
          : [],
      },
      reparacionesDeTercero: {
        create: fakerES.datatype.boolean()
          ? fakerES.helpers
              .arrayElements(proveedores, { min: 1, max: 3 })
              .map((proveedor: any) => ({
                nombre: fakerES.commerce.productName(),
                precioCompra: fakerES.number.float({
                  min: 5000,
                  max: 50000,
                  precision: 0.01,
                }),
                precioVenta: fakerES.number.float({
                  min: 7000,
                  max: 70000,
                  precision: 0.01,
                }),
                proveedorId: proveedor.id,
              }))
          : [],
      },
      trabajosRealizados: {
        create: fakerES.helpers.arrayElements([1, 2, 3, 4, 5]).map(() => ({
          descripcion: fakerES.lorem.sentence(),
          precioUnitario: fakerES.number.float({
            min: 1000,
            max: 20000,
            precision: 0.01,
          }),
        })),
      },
    };

    await tx.ordenReparacion.create({ data: ordenData });
  }

  console.log(`Se generaron ${ordenesCount} órdenes de reparación de prueba.`);
}

async function generatePagosMecanicos(tx: any, pagosMecanicosCount: number) {
  console.log(
    `Generando pagos a mecánicos para órdenes de reparación terminadas...`
  );

  const ordenesTerminadas = await tx.ordenReparacion.findMany({
    where: {
      estado: "Terminado",
    },
    include: {
      mecanicos: true,
      pagos: true,
    },
  });

  for (const orden of ordenesTerminadas) {
    if (orden.pagos.length === 0) {
      const generarPago = fakerES.datatype.boolean();

      let monto = null;
      let fechaPago = null;

      if (generarPago) {
        monto = fakerES.number.float({
          min: 30000,
          max: 50000,
          precision: 0.01,
        });
        const diasAdicionales = fakerES.number.int({ min: 1, max: 30 });
        fechaPago = new Date(orden.fechaSalidaReparacion);
        fechaPago.setDate(fechaPago.getDate() + diasAdicionales);
      }

      await tx.pagoAMecanico.create({
        data: {
          ordenReparacionId: orden.id,
          monto: monto,
          fechaPago: fechaPago,
        },
      });
    }
  }

  console.log(
    `Se generaron pagos a mecánicos para las órdenes de reparación terminadas.`
  );
}

async function generateExtracciones(tx: any, extraccionesCount: number) {
  console.log(`Generando ${extraccionesCount} extracciones de prueba...`);

  const administradores = await tx.usuario.findMany({
    where: {
      rol: {
        name: "Administrador",
      },
    },
  });

  if (administradores.length === 0) {
    console.log(
      "No se encontraron usuarios con rol Administrador. No se generarán extracciones."
    );
    return;
  }

  const fechaInicio = new Date("2024-01-01");
  const fechaFin = new Date();

  for (let i = 0; i < extraccionesCount; i++) {
    const usuarioAleatorio = fakerES.helpers.arrayElement(administradores);
    const tipoExtraccion = fakerES.helpers.arrayElement([
      "EFECTIVO",
      "TRANSFERENCIA",
    ]);
    const fechaAleatoria = fakerES.date.between({
      from: fechaInicio,
      to: fechaFin,
    });

    await tx.extraccion.create({
      data: {
        monto: fakerES.number.float({ min: 1000, max: 50000, precision: 0.01 }),
        fecha: fechaAleatoria,
        usuarioId: usuarioAleatorio.id,
        motivo: fakerES.lorem.sentence(),
        tipoExtraccion: tipoExtraccion,
      },
    });
  }

  console.log(`Se generaron ${extraccionesCount} extracciones de prueba.`);
}

async function generateGastos(tx: any, gastosCount: number) {
  console.log(`Generando ${gastosCount} gastos de prueba...`);

  const categorias = await tx.categoriaGasto.findMany();
  const mecanicos = await tx.mecanico.findMany();
  const ordenesDeCompra = await tx.ordenDeCompra.findMany();

  for (let i = 0; i < gastosCount; i++) {
    const categoriaAleatoria = fakerES.helpers.arrayElement(categorias);
    const fechaAleatoria = fakerES.date.between({
      from: "2024-01-01T00:00:00.000Z",
      to: "2024-07-31T23:59:59.999Z",
    });

    let gastoData: any = {
      nombre: fakerES.commerce.productName(),
      precio: fakerES.number.float({ min: 100, max: 10000, precision: 0.01 }),
      fecha: fechaAleatoria,
      categoriaId: categoriaAleatoria.id,
    };

    if (
      categoriaAleatoria.nombre === "Pago Mecánicos" &&
      mecanicos.length > 0
    ) {
      const mecanicoAleatorio = fakerES.helpers.arrayElement(mecanicos);
      gastoData = { ...gastoData, mecanicoId: mecanicoAleatorio.id };
    } else if (
      categoriaAleatoria.nombre === "Pago Proveedores" &&
      ordenesDeCompra.length > 0
    ) {
      const ordenDeCompraAleatoria =
        fakerES.helpers.arrayElement(ordenesDeCompra);
      gastoData = { ...gastoData, ordenDeCompraId: ordenDeCompraAleatoria.id };
    }

    await tx.gasto.create({ data: gastoData });
  }

  console.log(`Se generaron ${gastosCount} gastos de prueba.`);
}

async function generateIngresos(tx: any, ingresosCount: number) {
  console.log(
    `Generando ${ingresosCount} ingresos por reparación de prueba...`
  );

  const ordenesReparacion = await tx.ordenReparacion.findMany({
    include: {
      auto: {
        include: {
          owner: true,
        },
      },
      repuestosUsados: true,
      reparacionesDeTercero: true,
    },
  });

  for (let i = 0; i < ingresosCount; i++) {
    const ordenAleatoria = fakerES.helpers.arrayElement(ordenesReparacion);

    const totalOrden = calcularTotalOrdenReparacion(ordenAleatoria);

    const esPagoCompleto = fakerES.datatype.boolean({ probability: 0.75 });
    const monto = esPagoCompleto
      ? totalOrden
      : fakerES.number.float({
          min: totalOrden * 0.1,
          max: totalOrden * 0.9,
          precision: 0.01,
        });

    const fechaPago = fakerES.date.between({
      from: ordenAleatoria.fechaCreacion,
      to: new Date(),
    });

    await tx.ingresoPorReparacion.create({
      data: {
        fecha: fechaPago,
        clienteId: ordenAleatoria.auto.owner.id,
        monto: monto,
        descripcion: `Pago por reparación del vehículo ${ordenAleatoria.auto.patent}`,
        ordenReparacionId: ordenAleatoria.id,
      },
    });
  }

  console.log(
    `Se generaron ${ingresosCount} ingresos por reparación de prueba.`
  );
}

async function generateTestData({
  stock = false,
  ordenCompra = false,
  ventas = false,
  ordenReparacion = false,
  pagosMecanicos = false,
  extracciones = false,
  gastos = false,
  ingresos = false,
}) {
  try {
    await generateTestPrisma.$transaction(async (tx: any) => {
      if (stock) {
        await generateStockData(tx, 100); // Número de elementos de stock a generar
      }
      if (ordenCompra) {
        await generateOrdenesDeCompra(tx, 50); // Nmero de órdenes de compra a generar
      }
      if (ventas) {
        await generateVentas(tx, 50); // Nmero de ventas a generar
      }
      if (ordenReparacion) {
        await generateOrdenesDeReparacion(tx, 100); // Nmero de órdenes de reparación a generar
      }
      if (pagosMecanicos) {
        await generatePagosMecanicos(tx, 100); // Nmero de pagos de mecanicos a generar
      }
      if (extracciones) {
        await generateExtracciones(tx, 100); // Nmero de extracciones a generar
      }
      if (gastos) {
        await generateGastos(tx, 100); // Nmero de gastos a generar
      }
      if (ingresos) {
        await generateIngresos(tx, 100); // Nmero de ingresos a generar
      }
    });

    console.log("Datos de prueba generados exitosamente");
  } catch (error) {
    console.error("Error al generar datos de prueba:", error);
    process.exit(1);
  } finally {
    await generateTestPrisma.$disconnect();
  }
}

async function generateVentas(tx: any, ventasCount: number) {
  console.log(`Generando ${ventasCount} ventas de prueba...`);

  const clientes = await tx.cliente.findMany();
  const stocks = await tx.stock.findMany();

  for (let i = 0; i < ventasCount; i++) {
    const randomCliente = fakerES.helpers.arrayElement(clientes);
    const itemCount = fakerES.number.int({ min: 1, max: 4 });
    const items = [];
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      const randomStock = fakerES.helpers.arrayElement(stocks);
      const cantidad = fakerES.number.int({ min: 1, max: 5 });

      if (randomStock.units && randomStock.units >= cantidad) {
        const precioVenta =
          Number(randomStock.buyPrice) * (1 + (randomStock.markup || 0.3));
        total += precioVenta * cantidad;

        items.push({
          stockId: randomStock.id,
          cantidad: cantidad,
        });

        // Actualizar el stock
        await tx.stock.update({
          where: { id: randomStock.id },
          data: { units: { decrement: cantidad } },
        });
      }
    }

    if (items.length > 0) {
      const fechaVenta = fakerES.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2024-07-31T23:59:59.999Z",
      });

      await tx.venta.create({
        data: {
          fecha: fechaVenta,
          clienteId: randomCliente.id,
          total: total,
          items: {
            create: items,
          },
        },
      });
    }
  }
  console.log(`Se generaron ${ventasCount} ventas de prueba.`);
}

generateTestData({
  stock: false,
  ordenCompra: false,
  ventas: false,
  ordenReparacion: false,
  pagosMecanicos: false,
  extracciones: false,
  gastos: false,
  ingresos: false,
});
