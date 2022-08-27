import {
  getAdministratorsByID,
  getOwnerByID,
} from "../services/company.service.js";
import handler from "../utils/handler.js";
import logger from "../../../logger.js";

const ownerOnly = async (req, res, next) => {
  const companyID = req.params.companyID || req.body.companyID;
  const ID = req.session.ID;
  const [company, error] = await handler(getOwnerByID, null, companyID);
  if (error) {
    logger.error({ name: "ownerOnlyCompany", error, companyID, ID });
    return res.status(500).json({
      content:
        "Nedefinita servila eraro. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!company) {
    return res.status(404).json({ content: "Ĉi tiu paĝo ne ekzistas." });
  }
  const isOwner = ID === company.owner;
  if (isOwner) {
    next();
  } else {
    res.status(401).json({ content: "Nur posedanto povas fari tion." });
  }
};

const adminOnly = async (req, res, next) => {
  const companyID = req.params.companyID || req.body.companyID;
  const ID = req.session.ID;
  const [company, error] = await handler(
    getAdministratorsByID,
    null,
    companyID
  );
  if (error) {
    logger.error({ name: "adminOnlyCompany", error, companyID, ID });
    return res.status(500).json({
      content:
        "Nedefinita servila eraro. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!company) {
    return res.status(404).json({ content: "Ĉi tiu paĝo ne ekzistas." });
  }
  const isAdmin = company.administrators.some(
    (administrator) => administrator.ID === ID
  );
  if (isAdmin) {
    next();
  } else {
    res.status(401).json({ content: "Nur administranto povas fari tion." });
  }
};

export { adminOnly, ownerOnly };
