import {
  createByCompanyID,
  removeByID,
  updateByID,
  getByID,
  getPageByOffset,
  getCount,
  addFollowerByID,
  removeFollowerByID,
} from "../services/offer.service.js";
import { countFollowed, unsubscribeByEmail } from "../services/user.service.js";
import countriesList from "../../../../countries.js";
import categoriesList from "../../../../categories.js";
import sanitizeHtml from "sanitize-html";
import handler from "../utils/handler.js";
import prismaPkg from "@prisma/client";
import jwt from "jsonwebtoken";
const { Prisma } = prismaPkg;

const offsetPagination = async ({
  q: searchQuery,
  p: page,
  d: employmentTypes,
  m: arrangements,
  k: categories,
  l: countries,
  de: of,
  nm: onlyOpened,
}) => {
  const where = {};
  if (onlyOpened) {
    where.closed = false;
  }
  if (searchQuery) {
    where.title = {
      search: searchQuery,
    };
    where.description = {
      search: searchQuery,
    };
  }
  if (countries) {
    where.country = {
      in: countries.split(",").map((i) => countriesList[+i]),
    };
  }
  if (categories) {
    where.OR = categories.split(",").map((i) => ({
      categories: { array_contains: categoriesList[+i] },
    }));
  }
  if (arrangements) {
    where.arrangement = { in: arrangements.split(",") };
  }
  if (employmentTypes) {
    where.employment = { in: employmentTypes.split(",") };
  }
  if (of) {
    where.company_ID = of;
  }
  const take = 10;
  let skip = (page - 1) * take;
  const count = await getCount(where);
  const pages = Math.ceil(count / 10);
  const offers = await getPageByOffset(skip, take, where);
  return { offers, pages };
};

const getPage = async (req, res) => {
  try {
    const offers = await offsetPagination(req.query);
    res.json(offers);
  } catch (e) {
    console.error({ name: "getPageOffer misc error", error: e });
    res.status(500).json({
      content:
        "Ni ial ne povis sendi liston de ofertoj. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const create = async (req, res) => {
  const { companyID, ...data } = req.body;
  const sanitizedDescription = sanitizeHtml(data.description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
  data.description = sanitizedDescription;
  const [offer, error] = await handler(
    createByCompanyID,
    null,
    companyID,
    data
  );
  if (error) {
    console.error({
      name: "createOffer misc error",
      error,
      companyID,
      sesssionID: req.session.ID,
      data,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis krei la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  console.info(`${req.session.ID} created new offer of id ${offer.ID}.`);
  res.json(offer);
};

const remove = async (req, res) => {
  const offerID = req.params.offerID;
  const [, error] = await handler(removeByID, null, offerID);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res
        .status(404)
        .json({ content: "Oferto kun ĉi tiu identigilo ne ekzistas." });
    }
    console.error({
      name: "removeOffer misc error",
      error,
      offerID,
      sesssionID: req.session.ID,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis forigi la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  console.info(`${req.session.ID} removed offer of id ${offerID}.`);
  res.json({ content: "La oferto estis forigita." });
};

const editSeveral = async (req, res) => {
  const arr = req.body.array;

  await arr.forEach(async ({ ID, closed, close_at }) => {
    const [, error] = await handler(updateByID, null, ID, {
      closed,
      close_at,
    });
    if (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2018"
      ) {
        return res
          .status(404)
          .json({ content: "Oferto kun ĉi tiu identigilo ne ekzistas." });
      }
      console.error({
        name: "editSeveralOffer misc error",
        error,
        sesssionID: req.session.ID,
      });
      return res.status(500).json({
        content:
          "Ni ial ne povis ĝisdatigi unu aŭ kelkajn ofertojn. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
      });
    }
  });
  console.info(
    `${req.session.ID} edited the following offers: ${arr
      .map(({ ID }) => ID)
      .join(", ")}.`
  );
  res.json({ content: "La ofertoj sukcese ĝisdatiĝis." });
};

const edit = async (req, res) => {
  const offerID = req.params.offerID;
  const { ...data } = req.body;
  const sanitizedDescription = sanitizeHtml(data.description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
  data.description = sanitizedDescription;
  const [, error] = await handler(updateByID, null, offerID, data);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res
        .status(404)
        .json({ content: "Oferto kun ĉi tiu identigilo ne ekzistas." });
    }
    console.error({
      name: "editOffer misc error",
      error,
      sesssionID: req.session.ID,
      offerID,
      data,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis ĝisdatigi la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  console.info(`${req.session.ID} edited offer of id ${offerID}.`);
  res.json({ content: "La ŝanĝoj estis akceptitaj." });
};

const get = async (req, res) => {
  const sessionID = req.session?.ID;
  const offerID = req.params.offerID;
  const [offer, error] = await handler(getByID, null, offerID);
  if (error) {
    console.error({
      name: "getOffer misc error",
      error,
      sesssionID,
      offerID,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis akiri la oferton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!offer) {
    return res
      .status(404)
      .json({ content: "Oferto kun ĉi tiu identigilo ne ekzistas." });
  }
  const ownerIndex = offer.company.administrators.some(
    (administrator) => administrator.ID === sessionID
  );
  offer.isOwner = ownerIndex;
  res.json(offer);
};

const addFollower = async (req, res) => {
  const offerID = req.params.ID;
  const userID = req.session.ID;
  try {
    const [user, countError] = await handler(countFollowed, null, userID);
    if (user === null) {
      return res
        .status(404)
        .json({ content: "Uzanto kun ĉi tiu identigilo ne ekzistas." });
    }
    if (countError) {
      throw countError;
    }
    const amountOfFollowed = user._count.watchlist;
    if (amountOfFollowed > 29) {
      return res
        .status(422)
        .json({ content: "Oni povas observi maksimume 30 ofertojn." });
    }
    const [, addError] = await handler(addFollowerByID, null, offerID, userID);
    if (addError) {
      if (
        addError instanceof Prisma.PrismaClientKnownRequestError &&
        addError.code === "P2018"
      ) {
        return res
          .status(404)
          .json({ content: "Oferto kun ĉi tiu identigilo ne ekzistas." });
      }
      throw addError;
    }
    console.info(`User ${userID} added offer ${offerID} to their watchlist.`);
    res.json({ content: "Farite :)" });
  } catch (e) {
    console.error({
      name: "addFollower misc error",
      error: e,
      userID,
      offerID,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis aldoni la sekvanton al la oferto. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const removeFollower = async (req, res) => {
  const offerID = req.params.ID;
  const userID = req.session.ID;
  const [, error] = await handler(removeFollowerByID, null, offerID, userID);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (addError.code === "P2018" || addError.code === "P2025")
    ) {
      if (error.code === "P2018") {
        return res
          .status(404)
          .json({ content: "Oferto kun ĉi tiu identigilo ne ekzistas." });
      } else if (error.code === "P2025") {
        return res
          .status(404)
          .json({ content: "Uzanto kun ĉi tiu identigilo ne ekzistas." });
      }
    }
    console.error({
      name: "removeFollower misc error",
      error,
      userID,
      offerID,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis forigi la sekvanton de la oferto. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  res.json({ content: "Farite :)" });
};

const unsubscribe = async (req, res) => {
  try {
    const token = req.params.token;
    jwt.verify(
      token,
      process.env.SUBSCRIPTION_TOKEN_SECRET,
      async (err, decoded) => {
        try {
          if (err) {
            if (err.name === "TokenExpiredError") {
              return res
                .status(400)
                .json({ content: "La malabonĵetono senvalidiĝis." });
            } else if (err.name === "JsonWebTokenError") {
              return res.status(400).json({
                content:
                  "La malabonĵetono estas nevalida. Bonvolu kontroli, ĉu vi uzas la ĝustan ligilon.",
              });
            }
            throw err;
          }
          const email = decoded.email;
          const [, unsubscribingError] = await handler(
            unsubscribeByEmail,
            null,
            email
          );
          if (unsubscribingError) {
            console.error({
              name: "unsubscribe unsubscribingError",
              error: unsubscribingError,
              email: email,
            });
            return res.status(500).json({
              content:
                "Ni ial ne povis malabonigi vin. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
            });
          }
          console.info(`Confirmed ${email}.`);
          res.json({ content: "Vi malabonis la servon." });
        } catch (e) {
          console.error({
            name: "confirmEmail misc error",
            error: e,
            token: req.body.token,
          });
          return res.status(500).json({
            content:
              "Ni ial ne povis konfirmi la registriĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
          });
        }
      }
    );
  } catch (e) {
    console.error({
      name: "confirmEmail misc error",
      error: e,
      token: req.body.token,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis konfirmi la registriĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

export {
  getPage,
  create,
  remove,
  editSeveral,
  edit,
  get,
  addFollower,
  removeFollower,
  unsubscribe,
};
