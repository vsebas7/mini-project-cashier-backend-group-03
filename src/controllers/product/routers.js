import { Router } from "express"
import verifyUser from "../../middleware/token.verify.js"
import * as ProductControllers from "./index.js"
import { createCloudinaryStorage, createUploader } from "../../helpers/uploader.js"

const storage = createCloudinaryStorage("product-pic")
const uploader = createUploader(storage)
const router = Router()

router.get("/", verifyUser, ProductControllers.allProduct)
router.post("/", verifyUser, ProductControllers.addProduct)
router.get("/category", verifyUser, ProductControllers.allCategory)
router.post("/category", verifyUser, ProductControllers.addCategory)
router.patch("/category", verifyUser, ProductControllers.changeCategoryStatus)
router.delete("/category", verifyUser, ProductControllers.deleteCategory)
router.get("/category/subcategory", verifyUser, ProductControllers.parentCategory)
router.get("/:product_id", verifyUser, ProductControllers.productDetails)
router.patch("/change-name", verifyUser, ProductControllers.changeName)
router.patch("/change-price", verifyUser, ProductControllers.changePrice)
router.patch("/change-desc", verifyUser, ProductControllers.changeDesc)
router.patch("/change-category", verifyUser, ProductControllers.changeCategory)
router.patch("/change-image/:product_id", verifyUser, uploader.single("file"), ProductControllers.changeImage)
router.patch("/change-status/", verifyUser, ProductControllers.changeStatus)

export default router
