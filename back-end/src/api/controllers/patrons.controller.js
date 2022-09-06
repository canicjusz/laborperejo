import { getPatrons } from "../services/patrons.service.js";
import { getNameByID as getUserNameByID } from "../services/user.service.js";
import { getNameByID as getCompanyNameByID } from "../services/company.service.js";
import handler from "../utils/handler.js";
import logger from "../../../logger.js";

const convertPatron = async ({ type, ID, message }) => {
  const isUser = type === "user";
  const newPatron = { message };
  if (isUser) {
    newPatron.link = "/uzantoj/" + ID;
    newPatron.name = (await getUserNameByID(ID)).name;
  } else {
    newPatron.link = "/firmaoj/" + ID;
    newPatron.name = (await getCompanyNameByID(ID)).name;
  }
  return newPatron;
};

const get = async (req, res) => {
  const [patrons, error] = await handler(getPatrons, null);
  if (error) {
    console.log(error);
    logger.error({
      name: "getPatrons misc error",
      error,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis elŝuti liston de mecenatoj. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  const convertedPatrons = await Promise.all(patrons.map(convertPatron));
  res.json(convertedPatrons);
};

export { get };
