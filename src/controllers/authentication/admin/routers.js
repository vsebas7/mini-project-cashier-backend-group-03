import { Router } from "express"
import verifyUser from "../../../middleware/token.verify.js"
import * as AdminControllers from "./index.js"
import { createCloudinaryStorage, createUploader } from "../../../helpers/uploader.js"

const storage = createCloudinaryStorage("profiles")
const uploader = createUploader(storage)
const router = Router()

router.post("/login", AdminControllers.login)
router.get("/keep_login", verifyUser, AdminControllers.keepLogin)
router.put("/forgot-password", AdminControllers.forgotPassword)
router.patch("/reset-password", verifyUser, AdminControllers.resetPassword)
router.get("/cashier/", verifyUser, AdminControllers.getCashier)
router.post("/cashier/register", verifyUser, AdminControllers.registerCashier)
router.patch("/cashier/update-status", verifyUser, AdminControllers.changeStatus)

export default router
