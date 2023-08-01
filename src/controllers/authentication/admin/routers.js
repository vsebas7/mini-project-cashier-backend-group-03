import { Router } from "express"
import { verifyUser, verifyTokenResetPassword, verifyAdmin } from "../../../middleware/token.verify.js"
import * as AdminControllers from "./index.js"

const router = Router()

router.post("/login", AdminControllers.login)
router.get("/keep-login", verifyUser, AdminControllers.keepLogin)
router.put("/forgot-password", AdminControllers.forgotPassword)
router.patch("/reset-password", verifyTokenResetPassword, verifyUser, AdminControllers.resetPassword)
router.get("/cashier/", verifyAdmin, AdminControllers.getCashier)
router.post("/cashier/register", verifyAdmin, AdminControllers.registerCashier)
router.patch("/cashier", verifyAdmin, AdminControllers.deactiveCashier)
router.get("/cashier/:idCashier", verifyAdmin, AdminControllers.getCashierDetail)
router.patch("/cashier/:idCashier", verifyAdmin, AdminControllers.editCashier)

export default router
