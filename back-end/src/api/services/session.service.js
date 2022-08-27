import prisma from "../../prisma.js";

const destroySessions = async (ID, sid = "") =>
  await prisma.session.deleteMany({
    where: {
      NOT: {
        sid,
      },
      data: {
        endsWith: `"ID":${ID}}`,
      },
    },
  });

export { destroySessions };
