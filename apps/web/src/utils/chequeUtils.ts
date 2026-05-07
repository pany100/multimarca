import prisma from "@/lib/prisma";
import * as yup from "yup";
import { deleteFileFromS3, moveFileInS3 } from "./s3Helper";

export const CHEQUE_OPERACION_IDS = [3, 9, 21];

const isChequeOperacion = (operacion: number) =>
  CHEQUE_OPERACION_IDS.includes(operacion);

export const getSchemaPropsForCheque = (baseField: string) => {
  const requiresNewCheque = (
    baseFieldValue: number,
    chequeIdValue: number | null
  ) => isChequeOperacion(baseFieldValue) && chequeIdValue === null;

  return {
    chequeId: yup.number().nullable(),
    fechaEmision: yup.mixed().when([baseField, "chequeId"], {
      is: requiresNewCheque,
      then: (schema) => yup.date().required("La fecha de emisión es requerida"),
      otherwise: (schema) => yup.mixed(),
    }),
    fechaCobro: yup.mixed().when([baseField, "chequeId"], {
      is: requiresNewCheque,
      then: (schema) => yup.date().required("La fecha de cobro es requerida"),
      otherwise: (schema) => yup.mixed(),
    }),
    numeroCheque: yup.mixed().when([baseField, "chequeId"], {
      is: requiresNewCheque,
      then: (schema) =>
        yup.string().required("El número de cheque es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    banco: yup.mixed().when([baseField, "chequeId"], {
      is: requiresNewCheque,
      then: (schema) => yup.string().required("El banco es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    importe: yup.mixed().when([baseField, "chequeId"], {
      is: requiresNewCheque,
      then: (schema) =>
        yup
          .number()
          .typeError("El importe debe ser un número")
          .required("El importe es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    emisor: yup.mixed().when([baseField, "chequeId"], {
      is: requiresNewCheque,
      then: (schema) => yup.string().required("El emisor es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    picturePath: yup.mixed().when([baseField, "chequeId"], {
      is: requiresNewCheque,
      then: (schema) => yup.string().required("La foto es requerida"),
      otherwise: (schema) => yup.mixed(),
    }),
  };
};

type Cheque = {
  banco: string;
  emisor: string;
  fechaCobro: Date;
  fechaEmision: Date;
  importe: number;
  numeroCheque: string;
  picturePath: string;
};

type SaveChequeProps = {
  cheque: Cheque;
};

type ChequeRequestData = {
  chequeId?: string | null;
} & Cheque;

type ChequeEditRequestData = Omit<Cheque, "numeroCheque" | "emisor"> & {
  numero: string;
  owner: string;
};

const saveCheque = async ({ cheque }: SaveChequeProps) => {
  const {
    banco,
    emisor,
    fechaCobro,
    fechaEmision,
    importe,
    numeroCheque,
    picturePath,
  } = cheque;
  let picturePathUrl = picturePath;
  if (picturePath && picturePath.includes("/tmp/")) {
    picturePathUrl = await moveFileInS3(picturePath, "cheques");
  }
  const newCheque = await prisma.cheque.create({
    data: {
      banco,
      owner: emisor,
      fechaCobro,
      fechaEmision,
      importe,
      numero: numeroCheque,
      picturePath: picturePathUrl,
    },
  });
  return newCheque;
};

export const deleteCheque = async (idCheque: number) => {
  const cheque = await prisma.cheque.findFirst({
    where: {
      id: idCheque,
    },
  });
  if (cheque) {
    if (cheque.picturePath) {
      await deleteFileFromS3(cheque.picturePath);
    }
    await prisma.cheque.delete({
      where: {
        id: idCheque,
      },
    });
  }
};

export const chequeQueryData = {
  select: {
    id: true,
    numero: true,
    banco: true,
    importe: true,
    fechaCobro: true,
    fechaEmision: true,
    owner: true,
    picturePath: true,
    rechazado: true,
  },
};

export const returnAllModelsWithChequeData = (models: { cheque?: any }[]) => {
  return models.map((model) => returnModelWithChequeData(model));
};

export const returnModelWithChequeData = (model: { cheque?: any }) => {
  const cheque = model.cheque;
  if (!cheque) return model;
  return {
    ...model,
    banco: cheque.banco,
    emisor: cheque.owner,
    fechaCobro: cheque.fechaCobro,
    fechaEmision: cheque.fechaEmision,
    importe: cheque.importe,
    numeroCheque: cheque.numero,
    picturePath: cheque.picturePath,
    chequeId: cheque.id,
  };
};

export const validateChequeRequest = (
  data: ChequeRequestData,
  operacion: number
) => {
  const {
    banco,
    emisor,
    fechaCobro,
    fechaEmision,
    importe,
    numeroCheque,
    chequeId,
    picturePath,
  } = data;
  if (isChequeOperacion(operacion)) {
    if (
      !chequeId &&
      (!banco ||
        !emisor ||
        !fechaCobro ||
        !fechaEmision ||
        !importe ||
        !numeroCheque ||
        !picturePath)
    ) {
      return false;
    }
  }
  return true;
};

export const validateChequeEditRequest = (data: ChequeEditRequestData) => {
  const {
    banco,
    numero,
    fechaCobro,
    fechaEmision,
    importe,
    owner,
    picturePath,
  } = data;
  if (
    !banco ||
    !numero ||
    !fechaCobro ||
    !fechaEmision ||
    !importe ||
    !owner ||
    !picturePath
  ) {
    return false;
  }
  return true;
};

export const getChequeIdAndValidate = async (
  data: ChequeRequestData,
  operacion: number
) => {
  if (!isChequeOperacion(operacion)) {
    return null;
  }
  if (data.chequeId) {
    const operaciones = await getOperacionesByChequeId(parseInt(data.chequeId));
    if (operaciones.length > 3) {
      throw new Error("El cheque ya ha sido utilizado");
    }
    return parseInt(data.chequeId);
  }
  const {
    banco,
    emisor,
    fechaCobro,
    fechaEmision,
    importe,
    numeroCheque,
    picturePath,
  } = data;
  const newCheque = await saveCheque({
    cheque: {
      banco,
      emisor,
      fechaCobro,
      fechaEmision,
      importe,
      numeroCheque,
      picturePath,
    },
  });
  return newCheque.id;
};

export const getOperacionesByChequeId = async (chequeId: number) => {
  const operaciones = [];

  // Get Ventas
  const ingresosPorVentas = await prisma.ingresoPorVenta.findMany({
    where: { chequeId },
    select: {
      id: true,
      fecha: true,
      descripcion: true,
      venta: true,
    },
  });

  for (const ingreso of ingresosPorVentas) {
    operaciones.push({
      idOperacion: ingreso.id,
      tipo: "VENTA",
      fecha: ingreso.fecha,
      descripcion: `Venta a ${ingreso.descripcion || "No especificado"}`,
    });
  }

  // Get Gastos
  const gastos = await prisma.gasto.findMany({
    where: { chequeId },
    select: {
      id: true,
      fecha: true,
      nombre: true,
    },
  });

  for (const gasto of gastos) {
    operaciones.push({
      idOperacion: gasto.id,
      tipo: "GASTO",
      fecha: gasto.fecha,
      descripcion: gasto.nombre,
    });
  }

  // Get Extracciones
  const extracciones = await prisma.extraccion.findMany({
    where: { chequeId },
    select: {
      id: true,
      fecha: true,
      motivo: true,
    },
  });

  for (const extraccion of extracciones) {
    operaciones.push({
      idOperacion: extraccion.id,
      tipo: "EXTRACCION",
      fecha: extraccion.fecha,
      descripcion: extraccion.motivo,
    });
  }

  // Get IngresoManualDeDinero
  const ingresosManuales = await prisma.ingresoManualDeDinero.findMany({
    where: { chequeId },
    select: {
      id: true,
      fecha: true,
      descripcion: true,
    },
  });

  for (const ingreso of ingresosManuales) {
    operaciones.push({
      idOperacion: ingreso.id,
      tipo: "INGRESO_MANUAL",
      fecha: ingreso.fecha,
      descripcion: ingreso.descripcion || "Ingreso manual",
    });
  }

  // Get IngresoPorReparacion
  const ingresosReparacion = await prisma.ingresoPorReparacion.findMany({
    where: { chequeId },
    select: {
      id: true,
      fecha: true,
      descripcion: true,
    },
  });

  for (const ingreso of ingresosReparacion) {
    operaciones.push({
      idOperacion: ingreso.id,
      tipo: "INGRESO_REPARACION",
      fecha: ingreso.fecha,
      descripcion: ingreso.descripcion,
    });
  }

  return operaciones;
};

export async function validateBeforeDelete(chequeId: number) {
  const operaciones = await getOperacionesByChequeId(chequeId);
  return operaciones.length === 0;
}
