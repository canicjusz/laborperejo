import Prisma from "@prisma/client";
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

async function main() {
  const john = await prisma.user.upsert({
    create: {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "$2b$10$7WPPXcgowvtMva8wpnknE.vl6pX93EYlqx/lKN33ykjWzNWZ9JVnu",
      companies: {
        create: [],
      },
      confirmed: true,
      profile: {
        create: {
          content: "Bonvenon al mia profilo.",
          avatar: "/avatar/user-default.png",
          country: "Pollando",
          place: "Warszawa",
          languages: [
            { name: "pola", level: "denaske" },
            { name: "angla", level: "altnivele" },
          ],
        },
      },
    },
    where: {
      email: "johndoe@example.com",
    },
    update: {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "$2b$10$7WPPXcgowvtMva8wpnknE.vl6pX93EYlqx/lKN33ykjWzNWZ9JVnu",
      confirmed: true,
    },
  });

  const jane = await prisma.user.upsert({
    create: {
      name: "Jane Doe",
      email: "janedoe@example.com",
      password: "$2b$10$Io.dqc9VUs7D7Xf6R3kV5ONB5QLtn/Trh.ph1KFXTijOjpWVG/6Fq",
      companies: {
        create: [],
      },
      confirmed: true,
      profile: {
        create: {
          content: "Bonvenon al mia profilo.",
          avatar: "/avatar/user-default.png",
          country: "Pollando",
          place: "Poznań",
          languages: [
            { name: "pola", level: "denaske" },
            { name: "germana", level: "altnivele" },
          ],
        },
      },
    },
    where: {
      email: "janedoe@example.com",
    },
    update: {
      name: "Jane Doe",
      email: "janedoe@example.com",
      password: "$2b$10$Io.dqc9VUs7D7Xf6R3kV5ONB5QLtn/Trh.ph1KFXTijOjpWVG/6Fq",
      confirmed: true,
    },
  });
  console.log({ john, jane });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
