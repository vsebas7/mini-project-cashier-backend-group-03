import { Router } from "express"
import { verifyAdmin, verifyCashier, verifyUser } from "../../middleware/token.verify.js"
import * as TransactionController from "./index.js"

const router = Router()

router.post("/", verifyUser, TransactionController.addToCart)
router.patch("/", verifyUser, TransactionController.updateCartItem)
router.delete("/", verifyUser, TransactionController.removeFromCart)

export default router