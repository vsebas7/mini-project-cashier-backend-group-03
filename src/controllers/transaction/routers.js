import { Router } from "express"
import verifyUser from "../../middleware/token.verify.js"
import * as TransactionController from "./index.js"

const router = Router()

// router.get("/, verifyUser, TransactionController.")
router.post("/", verifyUser,TransactionController.addItemToCart)
// router.patch("/", verifyUser, TransactionController.updateItemInCart)
router.delete("/", verifyUser, TransactionController.removeItemFromCart)

export default router