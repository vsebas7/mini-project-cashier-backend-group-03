import { Router } from "express"
import { verifyAdmin } from "../../middleware/token.verify.js"
import * as ReportControllers from "./index.js"

const router = Router()

router.get("/", verifyAdmin, ReportControllers.allTransaction)
router.get("/all", verifyAdmin, ReportControllers.transactionReport)
router.get("/:transaction_id", ReportControllers.detailTransaction)

export default router
