import * as yup from "yup";
import countries from "../../../../countries.js";
import levels from "../../../../levels.js";
import { userID } from "./shared.js";

const editCurrentSchema = yup.object({
  name: yup.string().trim().required().max(100),
  content: yup.string().trim().required().max(8192),
  phone: yup
    .string()
    .trim()
    .matches(/^\+(?:[0-9] ?){6,14}[0-9]$/)
    .nullable(),
  email: yup.string().trim().email().max(320),
  fb: yup
    .string()
    .trim()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?facebook.com.*/)
    .max(500)
    .nullable(),
  vk: yup
    .string()
    .trim()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?vk.com.*/)
    .max(500)
    .nullable(),
  mv: yup
    .string()
    .trim()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?miavivo.net.*/)
    .max(500)
    .nullable(),
  searching: yup.boolean().required(),
  job: yup
    .string()
    .trim()
    .max(100)
    .when("searching", {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.nullable(),
    }),
  languages: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().trim().required(),
        level: yup.string().trim().oneOf(levels).required(),
      })
    )
    .min(1)
    .max(50),
  avatar: yup.string().trim().required(),
  place: yup.string().trim().max(100).required(),
  country: yup.mixed().oneOf(countries),
  resume: yup.string().trim().nullable(),
  website: yup.string().trim().url().max(500).nullable(),
  li: yup
    .string()
    .trim()
    .url()
    .matches(/^(?:(?:http|https):\/\/)?(?:www.)?linkedin.com.*/)
    .max(500)
    .nullable(),
  subscription: yup.boolean().required(),
  consent: yup.bool().required().oneOf([true]),
});

const getPageSchema = yup.object({
  q: yup.string().trim().ensure(),
  p: yup.number().positive().integer().default(1),
  s: yup.boolean(),
  l: yup
    .string()
    .trim()
    .matches(/^\d+((\,\d+)+)?$/),
  na: yup.number().positive().integer(),
});

const userIDSchema = yup.object({
  ID: userID,
});

export { editCurrentSchema, getPageSchema, userIDSchema };
