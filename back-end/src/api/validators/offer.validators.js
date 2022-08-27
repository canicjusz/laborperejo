import * as yup from "yup";
import countries from "../../../../countries.js";
import categories from "../../../../categories.js";

const workArrangements = ["hejme", "laboreje", "hibride"];
const employmentTypes = ["plentempa", "parttempa", "aldona"];

const createOfferSchema = yup.object({
  companyID: yup.number().integer().positive().required(),
  title: yup.string().trim().required().max(50),
  description: yup.string().trim().required().max(8192),
  salary: yup.boolean().required(),
  reward: yup.string().trim().required().max(70),
  arrangement: yup.mixed().oneOf(workArrangements).required(),
  employment: yup.mixed().oneOf(employmentTypes).required(),
  country: yup.mixed().oneOf(countries).required(),
  place: yup.string().trim().required().max(100),
  categories: yup
    .array()
    .of(yup.mixed().oneOf(categories))
    .min(1)
    .max(3)
    .required(),
  closed: yup.boolean().required(),
  close_at: yup.date().when("closed", {
    is: true,
    then: (schema) => schema.nullable(),
    otherwise: (schema) =>
      schema.required().transform((string) => new Date(string)),
  }),
});

const updateOfferSchema = yup.object({
  title: yup.string().trim().required().max(50),
  description: yup.string().trim().required().max(8192),
  salary: yup.boolean().required(),
  reward: yup.string().trim().required().max(70),
  arrangement: yup.mixed().oneOf(workArrangements).required(),
  employment: yup.mixed().oneOf(employmentTypes).required(),
  country: yup.mixed().oneOf(countries).required(),
  place: yup.string().trim().required().max(100),
  categories: yup.array().of(yup.mixed().oneOf(categories)).min(1).max(3),
  closed: yup.boolean().required(),
  close_at: yup.date().when("closed", {
    is: true,
    then: (schema) => schema.nullable(),
    otherwise: (schema) =>
      schema.required().transform((string) => new Date(string)),
  }),
});

const updateSeveralSchema = yup.object({
  array: yup.array().of(
    yup.object({
      ID: yup.number().required(),
      closed: yup.boolean().required(),
      close_at: yup.date().when("closed", {
        is: true,
        then: (schema) => schema.nullable(),
        otherwise: (schema) =>
          schema.required().transform((string) => new Date(string)),
      }),
    })
  ),
  companyID: yup.number().integer().positive().required(),
});

const getPageSchema = yup.object().shape({
  q: yup.string().trim().ensure(),
  p: yup.number().positive().integer().default(1),
  d: yup
    .string()
    .trim()
    .matches(
      /(plentempa|parttempa|aldona)((\,(plentempa|parttempa|aldona))+)?$/
    ),
  m: yup
    .string()
    .trim()
    .matches(/(hejme|laboreje|hibride)((\,(hejme|laboreje|hibride))+)?$/),
  k: yup
    .string()
    .trim()
    .matches(/^\d+((\,\d+)+)?$/),
  l: yup
    .string()
    .trim()
    .matches(/^\d+((\,\d+)+)?$/),
  de: yup.number().positive().integer(),
  nm: yup.boolean().default(true),
});

const offerIDSchema = yup.object({
  offerID: yup
    .number()
    .typeError("Identigilo de la oferto estu numero.")
    .positive("Identigilo estu pozitiva.")
    .integer("Identigilo estu entjero.")
    .required("Mankas identigilo de la uzanto en la ligilo."),
});

const tokenSchema = yup.object({
  token: yup.string().trim().required("Mankas ĵetono en la ligilo."),
});

export {
  getPageSchema,
  updateOfferSchema,
  updateSeveralSchema,
  createOfferSchema,
  offerIDSchema,
  tokenSchema,
};
