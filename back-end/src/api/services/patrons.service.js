import prisma from "../../prisma.js";

const getPatrons = async () => {
  const patrons = await prisma.patron.findMany();
  return patrons;
};

export { getPatrons };
