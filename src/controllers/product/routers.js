import { Router } from "express"
import { verifyAdmin, verifyUser } from "../../middleware/token.verify.js"
import * as ProductControllers from "./index.js"
import { createCloudinaryStorage, createUploader } from "../../helpers/uploader.js"
const storage = createCloudinaryStorage("product-pic")
const uploader = createUploader(storage)
const router = Router()

router.get("/", verifyUser, ProductControllers.allProduct)
router.post("/", verifyAdmin, uploader.single("file"), ProductControllers.addProduct)
router.get("/:product_id", verifyUser, ProductControllers.productDetails)
router.delete("/:product_id", verifyAdmin, ProductControllers.deleteProduct)
router.patch("/change-product-details/:product_id", verifyAdmin, ProductControllers.changeDetailProduct)
router.patch("/change-image/:product_id", verifyAdmin, uploader.single("file"), ProductControllers.changeImage)

export default router
