import { Router } from "express";
import { verifyUser } from "../../../middleware/token.verify.js";

// Import validation from admin folder
import * as AdminControllers from "./index.js";
import * as AdminValidation from "./validation.js"; 

const router = Router();

router.post("/login", AdminValidation.LoginValidationSchema, AdminControllers.login);
router.get("/keep_login", verifyUser, AdminControllers.keepLogin);
router.put("/forgot-password", AdminValidation.EmailValidationSchema, AdminControllers.forgotPassword);
router.patch("/reset-password", verifyUser, AdminValidation.resetPasswordSchema, AdminControllers.resetPassword);
router.get("/cashier/", verifyUser, AdminControllers.getCashier);
router.post("/cashier/register", verifyUser, AdminControllers.registerCashier);
router.patch("/cashier/update-status", verifyUser, AdminControllers.changeStatus);

export default router;
