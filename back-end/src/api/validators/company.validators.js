import * as yup from "yup";
import countries from "../../../../countries.js";
import categories from "../../../../categories.js";
import { companyID } from "./shared.js";

const getPageSchema = yup.object({
  q: yup.string().trim(),
  p: yup.number().positive().integer().default(1),
  k: yup
    .string()
    .trim()
    .matches(/^\d+((\,\d+)+)?$/),
  l: yup
    .string()
    .trim()
    .matches(/^\d+((\,\d+)+)?$/),
  mo: yup.boolean(),
  a: yup.number().positive().integer(),
});

const createCompanySchema = yup.object({
  industry: yup.mixed().oneOf(categories).required(),
  name: yup.string().trim().required().max(100),
  country: yup.mixed().oneOf(countries).required(),
  email: yup.string().trim().email().required().max(320),
  address: yup.string().trim().required().max(120),
});

const updateCompanySchema = yup.object({
  name: yup.string().trim().required().max(100),
  logo: yup
    .string()
    .trim()
    .matches(/^\/logo(.*)/)
    .required(),
  industry: yup.string().trim().required().max(100),
  description: yup.string().trim().required().max(8192),
  country: yup.mixed().oneOf(countries).required(),
  address: yup.string().trim().required().max(120),
  phone: yup
    .string()
    .trim()
    .matches(/^\+(?:[0-9] ?){6,14}[0-9]$/)
    .nullable(),
  email: yup.string().trim().email().required().max(320),
  website: yup
    .string()
    .trim()
    .transform((string) => (string == "" ? null : string))
    .url("La ligilo ne estas valida.")
    .max(500, "Ligilo ne povas havi pli ol 500 signojn.")
    .nullable(),
  li: yup
    .string()
    .trim()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?linkedin.com.*/)
    .max(500)
    .nullable(),
});

const companyIDSchema = yup.object({
  companyID,
});
export {
  getPageSchema,
  createCompanySchema,
  updateCompanySchema,
  companyIDSchema,
};
