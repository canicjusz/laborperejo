import { Router } from "express";
import { get } from "../controllers/patrons.controller.js";

const router = Router();

router.get("/api/patrons", get);

export default router;
