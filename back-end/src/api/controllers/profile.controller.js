import {
  updateByID,
  getUserAndProfileByID,
  getProfileByID,
  getPageByOffset,
  getCount,
} from "../services/profile.service.js";
import countriesList from "../../../../countries.js";
import sanitizeHtml from "sanitize-html";
import handler from "../utils/handler.js";
import prismaPkg from "@prisma/client";
import logger from "../../../logger.js";
const { Prisma } = prismaPkg;

const get = async (req, res) => {
  const sessionID = req.session?.ID;
  const paramsID = req.params.ID;
  const [user, error] = await handler(getProfileByID, null, paramsID);
  if (error) {
    logger.error({ name: "getProfile", error, paramsID });
    return res.status(500).json({
      content:
        "Ni ial ne povis sendi informojn pri la profilo. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!user) {
    return res
      .status(404)
      .json({ content: "Profilo kun ĉi tiu identigilo ne ekzistas." });
  }
  user.profile.my = sessionID === paramsID;
  res.json(user);
};

const editCurrent = async (req, res) => {
  const ID = req.session.ID;
  const { name, subscription, ...data } = req.body.json;
  const sanitizedContent = sanitizeHtml(data.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
  data.content = sanitizedContent;
  const [, error] = await handler(
    updateByID,
    null,
    ID,
    data,
    name,
    subscription
  );
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res
        .status(404)
        .json({ content: "Profilo kun ĉi tiu identigilo ne ekzistas." });
    }
    logger.error({ name: "editProfile", error, ID, data });
    return res.status(500).json({
      content:
        "Ni ial ne povis redakti la profilon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  logger.info(`User ${ID} edited their profile.`);
  res.json({ content: "La ŝanĝoj estis akceptitaj." });
};

const getCurrent = async (req, res) => {
  const sessionExists = req.session && req.session?.ID;
  if (sessionExists) {
    const ID = req.session.ID;
    const [user, error] = await handler(getUserAndProfileByID, null, ID);
    if (error) {
      logger.error({ name: "getCurrentProfile", error, ID });
      return res.status(500).json({
        content:
          "Ni ial ne povis sendi informojn pri la profilo. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
      });
    }
    if (!user) {
      return res
        .status(404)
        .json({ content: "Profilo kun ĉi tiu identigilo ne ekzistas." });
    }
    return res.json(user);
  }
  res.json(null);
};

const getPage = async (req, res) => {
  try {
    const {
      q: searchQuery,
      p: page,
      s: onlySearching,
      l: countries,
      na: notAdministratorOf,
    } = req.query;

    const where = {};
    if (searchQuery) {
      where.content = {
        search: searchQuery,
      };
      where.user_name = {
        search: searchQuery,
      };
    }
    if (countries) {
      where.country = {
        in: countries.split(",").map((i) => countriesList[+i]),
      };
    }
    if (onlySearching) {
      where.searching = true;
    }
    if (notAdministratorOf) {
      where.user = {
        companies: {
          none: {
            ID: notAdministratorOf,
          },
        },
      };
    }
    const take = 10;
    let skip = (page - 1) * take;
    const count = await getCount(where);
    const pages = Math.ceil(count / 10);
    const profiles = await getPageByOffset(skip, take, where);
    res.json({ profiles, pages });
  } catch (e) {
    logger.error({ name: "getCurrentProfile", error: e });
    res.status(500).json({
      content:
        "Ni ial ne povis sendi liston de profiloj. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

export { get, editCurrent, getCurrent, getPage };
