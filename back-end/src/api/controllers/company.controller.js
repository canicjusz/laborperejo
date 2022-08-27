import {
  getByID,
  removeByID,
  updateByID,
  createByID,
  getPageByOffset,
  getCount,
  removeAdministratorByID,
  addAdministratorByID,
  changeOwnerByID,
} from "../services/company.service.js";
import { getCount as getCountOffer } from "../services/offer.service.js";
import categoriesList from "../../../../categories.js";
import countriesList from "../../../../countries.js";
import sanitizeHtml from "sanitize-html";
import handler from "../utils/handler.js";
import prismaPkg from "@prisma/client";
import logger from "../../../logger.js";
const { Prisma } = prismaPkg;

const getPage = async (req, res) => {
  const take = 10;
  try {
    const {
      q: searchQuery,
      p: page,
      k: categories,
      l: countries,
      mo: havingOpenedOnly,
      a: administrator,
    } = req.query;

    const where = {};
    if (searchQuery) {
      where.name = {
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
        industry: categoriesList[+i],
      }));
    }
    if (havingOpenedOnly) {
      where.offers = {
        some: {
          closed: false,
        },
      };
    }
    if (administrator) {
      where.administrators = {
        some: {
          ID: administrator,
        },
      };
    }
    let skip = (page - 1) * take;
    const count = await getCount(where);
    const pages = Math.ceil(count / 10);
    const companies = await getPageByOffset(skip, take, where);
    res.json({ companies, pages });
  } catch (e) {
    logger.error({ name: "getPageCompany misc error", error: e });
    res.status(500).json({
      content:
        "Ni ial ne povis sendi liston de firmaoj. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const get = async (req, res) => {
  try {
    const ID = req.session?.ID;
    const companyID = req.params.companyID;
    const [company, error] = await handler(getByID, null, companyID);
    if (error) {
      throw error;
    }
    if (!company) {
      return res
        .status(404)
        .json({ content: "Firmao kun ĉi tiu identigilo ne ekzistas." });
    }
    const isOwner = ID === company.owner;
    company.isOwner = isOwner;
    const adminIndex = company.administrators.findIndex(
      (administrator) => administrator.ID === ID
    );
    if (adminIndex > -1) {
      company.isAdmin = true;
      company.offersNumber = await getCountOffer({ company_ID: companyID });
      company.offersOpenedNumber = await getCountOffer({
        company_ID: companyID,
        closed: false,
      });
      company.administrators.splice(adminIndex, 1);
    } else {
      company.isAdmin = false;
    }
    res.json(company);
  } catch (e) {
    logger.error({ name: "getCompany", error: e });
    return res.status(500).json({
      content:
        "Ni ial ne povis sendi informojn pri la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const create = async (req, res) => {
  const sessionID = req.session.ID;
  const [company, error] = await handler(createByID, null, sessionID, req.body);
  if (error) {
    logger.error({
      name: "createCompany",
      error: error,
      sessionID,
      data: req.body,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis krei la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  logger.info(`${sessionID} created new company of id ${company.ID}.`);
  res.json(company);
};

const remove = async (req, res) => {
  const companyID = req.params.companyID;
  const [, error] = await handler(removeByID, null, companyID);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res
        .status(404)
        .json({ content: "Firmao kun ĉi tiu identigilo ne ekzistas." });
    }
    logger.error({ name: "removeCompany misc error", error, companyID });
    return res.status(500).json({
      content:
        "Ni ial ne povis forigi la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  logger.info(`${req.session.ID} removed company of id ${companyID}.`);
  res.json({ content: "La firmao estis forigita." });
};

const edit = async (req, res) => {
  const data = req.body.json;
  const companyID = req.params.companyID;
  const sanitizedDescription = sanitizeHtml(data.description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
  data.description = sanitizedDescription;
  const [, error] = await handler(updateByID, null, companyID, data);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2018"
    ) {
      return res
        .status(404)
        .json({ content: "Firmao kun ĉi tiu identigilo ne ekzistas." });
    }
    logger.error({ name: "editCompany misc error", error, companyID, data });
    return res.status(500).json({
      content:
        "Ni ial ne povis redakti la firmaon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  logger.info(`${req.session.ID} edited company of id ${companyID}.`);
  res.json({ content: "La ŝanĝoj estis akceptitaj." });
};

const addAdministrator = async (req, res) => {
  const { companyID, userID } = req.params;
  const sessionUserID = req.session.ID;
  if (sessionUserID === userID) {
    return res.status(400).json({
      content: "Vi ne povas vin mem forigi, petu vian kolegon fari tion.",
    });
  }
  const [, error] = await handler(
    addAdministratorByID,
    null,
    companyID,
    userID
  );
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (addError.code === "P2018" || addError.code === "P2025")
    ) {
      if (error.code === "P2018") {
        return res
          .status(404)
          .json({ content: "Firmao kun ĉi tiu identigilo ne ekzistas." });
      } else if (error.code === "P2025") {
        return res
          .status(404)
          .json({ content: "Uzanto kun ĉi tiu identigilo ne ekzistas." });
      }
    }
    logger.error({
      name: "addAdministrator misc error",
      error,
      companyID,
      userID,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis aldoni la administranton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  logger.info(
    `${sessionUserID} added administrator ${userID} to company of id ${companyID}.`
  );
  res.json({ content: "La administranto estis aldonita." });
};

const removeAdministrator = async (req, res) => {
  const { companyID, userID } = req.params;
  const sessionUserID = req.session.ID;
  if (sessionUserID === userID) {
    return res.status(400).json({
      content: "Vi ne povas vin mem forigi, petu vian kolegon fari tion.",
    });
  }
  const [, error] = await handler(
    removeAdministratorByID,
    null,
    companyID,
    userID
  );
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (addError.code === "P2018" || addError.code === "P2025")
    ) {
      if (error.code === "P2018") {
        return res
          .status(404)
          .json({ content: "Firmao kun ĉi tiu identigilo ne ekzistas." });
      } else if (error.code === "P2025") {
        return res
          .status(404)
          .json({ content: "Uzanto kun ĉi tiu identigilo ne ekzistas." });
      }
    }
    logger.error({
      name: "removeAdministrator misc error",
      error,
      companyID,
      userID,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis forigi la administranton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  logger.info(
    `${sessionUserID} removed administrator ${userID} from company of id ${companyID}.`
  );
  res.json({ content: "La administranto estis forigita." });
};

const changeOwner = async (req, res) => {
  const { companyID, userID } = req.params;
  const sessionUserID = req.session.ID;
  if (sessionUserID === userID) {
    return res.status(400).json({
      content: "Vi jam estas posedanto.",
    });
  }
  const [, error] = await handler(changeOwnerByID, null, companyID, userID);
  if (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (addError.code === "P2018" || addError.code === "P2025")
    ) {
      if (error.code === "P2018") {
        return res
          .status(404)
          .json({ content: "Firmao kun ĉi tiu identigilo ne ekzistas." });
      } else if (error.code === "P2025") {
        return res
          .status(404)
          .json({ content: "Uzanto kun ĉi tiu identigilo ne ekzistas." });
      }
    }
    logger.error({
      name: "changeOwner misc error",
      error,
      companyID,
      userID,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis ŝanĝi posedanton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  logger.info(
    `${sessionUserID} changed owner of company ${companyID} to ${userID}`
  );
  res.json({ content: "Posedanto ŝanĝiĝis." });
};

export {
  get,
  getPage,
  create,
  remove,
  edit,
  addAdministrator,
  removeAdministrator,
  changeOwner,
};
