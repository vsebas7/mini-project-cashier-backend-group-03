import { Router } from "express";
import { verifyCashier } from "../../../middleware/token.verify.js";
import * as CashierControllers from "./index.js";

const router = Router();

router.post("/login", CashierControllers.login);
router.get("/keep_login", verifyCashier, CashierControllers.keepLogin);
router.put("/forgot-password", CashierControllers.forgotPassword);
router.patch("/reset-password", verifyCashier, CashierControllers.resetPassword);

export default router;