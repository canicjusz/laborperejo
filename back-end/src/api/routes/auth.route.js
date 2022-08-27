import { Router } from "express";
import {
  loginRequired,
  loginUnrequired,
  bannedOrUnconfirmed,
} from "../middlewares/auth.middleware.js";
import {
  confirmEmail,
  passwordReset,
  deleteSession,
  sendPasswordReset,
  login,
  register,
  editPassword,
  resendConfirmationEmail,
} from "../controllers/auth.controller.js";
import { ownerOnly } from "../middlewares/profile.middleware.js";
import {
  validateParams,
  validateBody,
} from "../middlewares/validate.middleware.js";
import { userIDSchema } from "../validators/profile.validators.js";
import {
  tokenSchema,
  loginSchema,
  registerSchema,
  emailSchema,
  passwordResetSchema,
  editPasswordSchema,
} from "../validators/auth.validators.js";

const router = Router();

router.put(
  "/api/account/confirmation",
  loginUnrequired,
  validateBody(tokenSchema),
  confirmEmail
);

router.delete("/api/session", loginRequired, deleteSession);

router.post("/api/session", loginUnrequired, validateBody(loginSchema), login);

router.post(
  "/api/profiles",
  loginUnrequired,
  validateBody(registerSchema),
  register
);

router.post(
  "/api/account/password",
  loginUnrequired,
  validateBody(emailSchema),
  sendPasswordReset
);

router.put(
  "/api/account/password",
  loginUnrequired,
  validateBody(passwordResetSchema),
  passwordReset
);

router.post(
  "/api/account/confirmation",
  loginUnrequired,
  validateBody(emailSchema),
  resendConfirmationEmail
);

router.put(
  "/api/account/:ID/password",
  validateParams(userIDSchema),
  bannedOrUnconfirmed,
  ownerOnly,
  validateBody(editPasswordSchema),
  editPassword
);

export default router;
