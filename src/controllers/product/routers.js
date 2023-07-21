import { Router } from "express"
import verifyUser from "../../middleware/token.verify.js"
import * as ProductControllers from "./index.js"
import { createCloudinaryStorage, createUploader } from "../../helpers/uploader.js"

const storage = createCloudinaryStorage("profiles")
const uploader = createUploader(storage)
const router = Router()

router.get("/", ProductControllers.allProduct)

export default router
