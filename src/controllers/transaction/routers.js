import { Router } from "express"
import { verifyCashier, verifyUser } from "../../middleware/token.verify.js"
import * as TransactionController from "./index.js"

const router = Router()

router.post("/cart", verifyCashier, TransactionController.addItemToCart)
router.delete("/cart/:itemId", verifyCashier, TransactionController.removeItemFromCart)
router.patch("/cart/:itemId", verifyCashier, TransactionController.updateItemInCart)
router.post("/", verifyCashier, TransactionController.createTransaction)

export default router