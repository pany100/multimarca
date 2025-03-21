import prisma from "@/lib/prisma";
import { OperacionCheque, TipoOperacion } from "@prisma/client";
import * as yup from "yup";
import { deleteFileFromS3, moveFileInS3 } from "./s3Helper";

export const getSchemaPropsForCheque = (baseField: string) => {
  return {
    chequeId: yup.number().nullable(),
    fechaEmision: yup.mixed().when([baseField, "chequeId"], {
      is: (baseFieldValue: string, chequeIdValue: number | null) =>
        baseFieldValue === "CHEQUE" && chequeIdValue === null,
      then: (schema) => yup.date().required("La fecha de emisión es requerida"),
      otherwise: (schema) => yup.mixed(),
    }),
    fechaCobro: yup.mixed().when([baseField, "chequeId"], {
      is: (baseFieldValue: string, chequeIdValue: number | null) =>
        baseFieldValue === "CHEQUE" && chequeIdValue === null,
      then: (schema) => yup.date().required("La fecha de cobro es requerida"),
      otherwise: (schema) => yup.mixed(),
    }),
    numeroCheque: yup.mixed().when([baseField, "chequeId"], {
      is: (baseFieldValue: string, chequeIdValue: number | null) =>
        baseFieldValue === "CHEQUE" && chequeIdValue === null,
      then: (schema) =>
        yup.string().required("El número de cheque es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    banco: yup.mixed().when([baseField, "chequeId"], {
      is: (baseFieldValue: string, chequeIdValue: number | null) =>
        baseFieldValue === "CHEQUE" && chequeIdValue === null,
      then: (schema) => yup.string().required("El banco es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    importe: yup.mixed().when([baseField, "chequeId"], {
      is: (baseFieldValue: string, chequeIdValue: number | null) =>
        baseFieldValue === "CHEQUE" && chequeIdValue === null,
      then: (schema) =>
        yup
          .number()
          .typeError("El importe debe ser un número")
          .required("El importe es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    emisor: yup.mixed().when([baseField, "chequeId"], {
      is: (baseFieldValue: string, chequeIdValue: number | null) =>
        baseFieldValue === "CHEQUE" && chequeIdValue === null,
      then: (schema) => yup.string().required("El emisor es requerido"),
      otherwise: (schema) => yup.mixed(),
    }),
    picturePath: yup.mixed().when([baseField, "chequeId"], {
      is: (baseFieldValue: string, chequeIdValue: number | null) =>
        baseFieldValue === "CHEQUE" && chequeIdValue === null,
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
  tipoOperacion: TipoOperacion;
  operacionCheque: OperacionCheque;
  idOperacion: number;
};

export const saveCheque = async ({
  cheque,
  tipoOperacion,
  operacionCheque,
  idOperacion,
}: SaveChequeProps) => {
  let newCheque = null;
  const {
    banco,
    emisor,
    fechaCobro,
    fechaEmision,
    importe,
    numeroCheque,
    picturePath,
  } = cheque;
  if (tipoOperacion === TipoOperacion.CHEQUE) {
    let picturePathUrl = picturePath;
    if (picturePath && picturePath.includes("/tmp/")) {
      picturePathUrl = await moveFileInS3(picturePath, "cheques");
    }
    newCheque = await prisma.cheque.create({
      data: {
        banco,
        owner: emisor,
        fechaCobro,
        fechaEmision,
        importe,
        numero: numeroCheque,
        operacionCheque: operacionCheque,
        operacionId: idOperacion,
        picturePath: picturePathUrl,
      },
    });
  }
  return newCheque;
};

export const getChequeForOperation = async (
  operacionCheque: OperacionCheque,
  idOperacion: number
) => {
  const cheque = await prisma.cheque.findFirst({
    where: {
      operacionCheque: operacionCheque,
      operacionId: idOperacion,
    },
  });
  return cheque;
};

export const getById = async (chequeId: number) => {
  const cheque = await prisma.cheque.findUnique({
    where: {
      id: chequeId,
    },
  });
  return cheque;
};

export const updateCheque = async ({
  cheque,
  operacionCheque,
  tipoOperacion,
  idOperacion,
}: SaveChequeProps) => {
  let newCheque = null;
  const { picturePath } = cheque;
  const existingCheque = await getChequeForOperation(
    operacionCheque,
    idOperacion
  );
  if (tipoOperacion === TipoOperacion.CHEQUE) {
    if (existingCheque) {
      let picturePathUrl = picturePath;
      if (picturePath && picturePath.includes("/tmp/")) {
        picturePathUrl = await moveFileInS3(picturePath, "cheques");
      }
      if (
        existingCheque?.picturePath &&
        existingCheque.picturePath !== picturePathUrl
      ) {
        await deleteFileFromS3(existingCheque.picturePath);
      }
      newCheque = await prisma.cheque.update({
        where: {
          id: existingCheque.id,
        },
        data: {
          fechaCobro: cheque.fechaCobro,
          fechaEmision: cheque.fechaEmision,
          importe: cheque.importe,
          banco: cheque.banco,
          owner: cheque.emisor,
          numero: cheque.numeroCheque,
          picturePath: picturePathUrl,
          operacionCheque: operacionCheque,
          operacionId: idOperacion,
        },
      });
    } else {
      newCheque = await saveCheque({
        cheque,
        operacionCheque,
        tipoOperacion,
        idOperacion,
      });
    }
  } else {
    if (existingCheque) {
      if (existingCheque.picturePath) {
        await deleteFileFromS3(existingCheque.picturePath);
      }
      await prisma.cheque.delete({
        where: {
          id: existingCheque.id,
        },
      });
    }
  }
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
