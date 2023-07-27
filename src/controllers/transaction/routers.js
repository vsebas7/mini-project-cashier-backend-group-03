import { Router } from "express"
import { verifyUser } from "../../middleware/token.verify.js"
import * as TransactionController from "./index.js"

const router = Router()

// router.post("/", verifyUser, TransactionController.addToCart)
router.post("/", verifyUser, TransactionController.createTransaction)
router.patch("/", verifyUser, TransactionController.updateCartItem)
router.delete("/", verifyUser, TransactionController.removeFromCart)

export default router