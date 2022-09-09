import cron from "node-cron";
import prisma from "./prisma.js";
import transporter from "./nodemailer.js";
import jwt from "jsonwebtoken";
const months = [
  "januaro",
  "februaro",
  "marto",
  "aprilo",
  "majo",
  "junio",
  "julio",
  "aŭgusto",
  "septembro",
  "oktobro",
  "novembro",
  "decembro",
];
const getDate = (string) => {
  const date = new Date(string);
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  return `la ${day}-an de ${months[monthIndex]} ${year}`;
};

const ourEmail = '"Jan Michalak" <oficejo@laborperejo.com>';
const host = process.env.BASE;

const sendOfferReminder = async (email, offers) => {
  const token = jwt.sign(
    {
      email,
    },
    process.env.SUBSCRIPTION_TOKEN_SECRET,
    {
      expiresIn: "60d",
    }
  );
  const url = `http://${host}/malaboni/${token}`;
  await transporter.sendMail({
    from: ourEmail,
    to: email,
    subject: "Baldaŭ fermiĝontaj ofertoj",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          .ExternalClass {
            width: 100%;
          }
        </style>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; margin: 0">
        <table
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="width: 600px; background: #f1f1f1"
        >
          <tbody>
            <tr>
              <td
                style="
                  text-align: center;
                  border-bottom: 1px solid #d7d7d7;
                  background: white;
                "
              >
                <img src="https://laborperejo.com/logo.png" />
              </td>
            </tr>
            <tr>
              <td>
                <h1 style="text-align: center; margin: 30px">Ne forgesu apliki!</h1>
                <p style="margin: 10px">
                  Jen ofertoj observitaj de vi, kiuj fermiĝos en 24 horoj:
                </p>
              </td>
            </tr>
            ${offers
              .map(
                (offer, index) => `<tr>
            <td ${
              index === offers.length - 1 && 'style="padding-bottom: 30px"'
            }>
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width: 600px; padding: 0 50px"
              >
                <tr style="background: white">
                  <td
                    style="vertical-align: top; border-bottom: 1px solid #d7d7d7"
                  >
                    <a href="${host}/ofertoj/${offer.ID}">
                      <img
                        style="padding: 10px"
                        src="${host + offer.company.logo}"
                      />
                    </a>
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #d7d7d7">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><h1 style="margin: 10px 0"><a href="${host}/ofertoj/${
                  offer.ID
                }">${offer.title}</a></h1></td>
                      </tr>
                      <tr>
                        <td><p style="margin: 0 0 10px 0"><a href="${host}/firmaoj/${
                  offer.company.ID
                }">${offer.company.name}</a>
                        en ${offer.place}, ${offer.country}</p></td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0">Dungeco: ${offer.employment}</p>
                          <p style="margin: 0">Maniero: ${offer.arrangement}</p>
                          <p style="margin: 0 0 10px 0">${
                            offer.salary ? "Salajro" : "Rekompenco"
                          }: ${offer.reward}</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <small>
                          Kreita ${getDate(
                            offer.created_at
                          )}, fermonta ${getDate(offer.close_at)}</small
                          >
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              )
              .join("")}
            <tr>
              <td>
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    width: 100%;
                    padding: 10px;
                    border-top: 1px solid #d7d7d7;
                    background: #ffffff;
                    color: #363736;
                  "
                >
                  <tr>
                    <td>
                      <small
                        >Ĉi tiu retpoŝtmesaĝo estis sendita de Laborperejo. Se vi ne
                        volas ricevi pliajn ofertrememorigojn, klaku
                        <a style="color: #1b75bc" href="${url}">ĉi tie</a>.</small
                      >
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding-top: 10px">
                      <small>
                        <a style="color: #1b75bc" href="${host}">Laborperejo</a> - farite de Jan
                        Michalak
                      </small>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`,
  });
};

const closeOffers = async () => {
  const now = new Date();
  await prisma.offer.updateMany({
    where: {
      closed: false,
      close_at: {
        lte: now,
      },
    },
    data: {
      closed: true,
      close_at: null,
    },
  });
};

const getClosingOffers = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const offers = await prisma.offer.findMany({
    take: 5,
    where: {
      close_at: {
        lte: tomorrow,
      },
      followers: {
        some: {
          subscription: true,
        },
      },
    },
    include: {
      followers: {
        select: {
          email: true,
        },
        where: {
          subscription: true,
        },
      },
      company: {
        select: {
          name: true,
          logo: true,
        },
      },
    },
  });
  const emailsMap = {};
  for (const offer of offers) {
    const followers = offer.followers;
    for (const follower of followers) {
      if (!emailsMap[follower.email]) {
        emailsMap[follower.email] = [];
      }
      emailsMap[follower.email].push(offer);
    }
  }
  for (const email in emailsMap) {
    await sendOfferReminder(email, emailsMap[email]);
  }
};

const removePasswordTokens = async () => {
  const now = new Date();
  await prisma.passwordToken.deleteMany({
    where: {
      expiresAt: {
        lte: now,
      },
    },
  });
};

cron.schedule("0 13 * * *", getClosingOffers);
cron.schedule("0 * * * *", closeOffers);
cron.schedule("0 * * * *", removePasswordTokens);
