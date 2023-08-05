import { Router } from "express"
import { verifyUser, verifyTokenResetPassword, verifyAdmin } from "../../middleware/token.verify.js"
import * as AuthControllers from "./index.js"

const router = Router()

router.post("/login", AuthControllers.login)
router.get("/keep-login", verifyUser, AuthControllers.keepLogin)
router.put("/forgot-password", AuthControllers.forgotPassword)
router.patch("/reset-password", verifyTokenResetPassword, verifyUser, AuthControllers.resetPassword)
router.get("/admin/cashier/", verifyAdmin, AuthControllers.getCashier)
router.post("/admin/cashier/register", verifyAdmin, AuthControllers.registerCashier)
router.patch("/admin/cashier", verifyAdmin, AuthControllers.deactiveCashier)
router.get("/admin/cashier/:idCashier", verifyAdmin, AuthControllers.getCashierDetail)
router.patch("/admin/cashier/:idCashier", verifyAdmin, AuthControllers.editCashier)

export default router
