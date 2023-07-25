import { Router } from "express"
import { verifyAdmin, verifyUser } from "../../middleware/token.verify.js"
import * as CategoryControllers from "./index.js"

const router = Router()

router.get("/", verifyUser, CategoryControllers.allCategory)
router.post("/", verifyAdmin, CategoryControllers.addCategory)
router.patch("/change-category-details/:category_id", verifyAdmin, CategoryControllers.changeDetailCategory)
router.get("/subcategory", verifyUser, CategoryControllers.subCategory)
router.delete("/:category_id", verifyAdmin, CategoryControllers.deleteCategory)

export default router