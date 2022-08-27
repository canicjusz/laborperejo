import { Router } from "express";
import {
  getCurrent,
  get,
  editCurrent,
  getPage,
} from "../controllers/profile.controller.js";
import {
  bannedOrUnconfirmed,
  loginRequired,
} from "../middlewares/auth.middleware.js";
import { profileUpload } from "../utils/multer.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { userIDSchema } from "../validators/profile.validators.js";
import {
  editCurrentSchema,
  getPageSchema,
} from "../validators/profile.validators.js";

const router = Router();

router.get("/api/profiles/mine", getCurrent);

router.put(
  "/api/profiles/mine",
  loginRequired,
  bannedOrUnconfirmed,
  profileUpload,
  validateBody(editCurrentSchema),
  editCurrent
);

router.get("/api/profiles", validateQuery(getPageSchema), getPage);

router.get("/api/profiles/:ID", validateParams(userIDSchema), get);

export default router;
