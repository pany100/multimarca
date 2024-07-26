import { PrismaClient } from "@prisma/client";
import axios from "axios";
import cron from "node-cron";

const prisma = new PrismaClient();

interface DolarData {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

async function obtenerDatosYActualizarDB() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando actualización de datos del dólar`
    );

    const response = await axios.get<DolarData[]>(
      "https://dolarapi.com/v1/dolares"
    );
    const datos = response.data;

    const blue = datos.find((d) => d.casa === "blue");
    const oficial = datos.find((d) => d.casa === "oficial");

    if (blue && oficial) {
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);

      const existingRecord = await prisma.dolar.findUnique({
        where: { fecha: fechaActual },
      });

      if (!existingRecord) {
        await prisma.dolar.create({
          data: {
            fecha: fechaActual,
            oficial: oficial.venta,
            blue: blue.venta,
          },
        });
        console.log(
          `Datos del dólar actualizados para ${fechaActual.toISOString()}`
        );
      } else {
        console.log(
          `Ya existen datos para ${fechaActual.toISOString()}, saltando actualización`
        );
      }
    } else {
      console.log("No se encontraron datos para dólar blue u oficial");
    }
  } catch (error) {
    console.error("Error al obtener o actualizar datos del dólar:", error);
  }
}

export function initDolarCron() {
  // Programar el cron job para que se ejecute a las 10:00, 14:00, 18:00 y 22:00 hora de Argentina
  cron.schedule("0 10,18,23 * * *", obtenerDatosYActualizarDB, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires",
  });

  console.log("Cron job para actualización de datos del dólar iniciado");
}
