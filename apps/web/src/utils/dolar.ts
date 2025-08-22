import prisma from "@/lib/prisma";

const getDolarForDate = async (fecha: Date) => {
  return await prisma.dolar.findFirst({
    where: {
      fecha: {
        lte: fecha,
      },
    },
    orderBy: {
      fecha: "desc",
    },
    select: {
      id: true,
    },
  });
};

export default getDolarForDate;
