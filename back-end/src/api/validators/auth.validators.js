import * as yup from "yup";
import countries from "../../../../countries.js";
import levels from "../../../../levels.js";

const registerSchema = yup.object({
  name: yup.string().trim().required().max(100),
  email: yup.string().trim().email().required().max(320),
  country: yup.mixed().oneOf(countries).required(),
  place: yup.string().trim().required().max(100),
  languages: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().trim().required(),
        level: yup.mixed().oneOf(levels).required(),
      })
    )
    .min(1)
    .max(50),
  password: yup
    .string()
    .trim()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/
    )
    .required(),
  consent: yup.bool().required().oneOf([true]),
});

const loginSchema = yup.object({
  email: yup.string().trim().required(),
  password: yup.string().trim().required(),
  saveSession: yup.boolean().required(),
});

const editPasswordSchema = yup.object({
  curr: yup.string().trim().required(),
  new: yup
    .string()
    .trim()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/
    )
    .required(),
});

const emailSchema = yup.object({
  email: yup.string().trim().email().required(),
});

const passwordResetSchema = yup.object({
  id: yup.number().positive().integer().required(),
  token: yup.string().trim().required(),
  password: yup
    .string()
    .trim()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/
    )
    .required(),
});

const tokenSchema = yup.object({
  token: yup.string().trim().required("Mankas ĵetono en la ligilo."),
});

export {
  passwordResetSchema,
  emailSchema,
  editPasswordSchema,
  loginSchema,
  registerSchema,
  tokenSchema,
};
