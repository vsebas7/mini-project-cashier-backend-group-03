import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./src/middleware/error.handler.js";

dotenv.config();

const app = express();

app.use(bodyParser.json())
app.use(cors({ exposedHeaders : "Authorization" }))

import AuthRouters from "./src/controllers/authentication/routers.js"
import ProductRouters from "./src/controllers/product/routers.js"
import CategoryRouters from "./src/controllers/category/routers.js"
import ReportRouters from "./src/controllers/report/routers.js"
import TransactionRouters from "./src/controllers/transaction/routers.js"

app.use("/api/auth/", AuthRouters)
app.use("/api/product", ProductRouters)
app.use("/api/category", CategoryRouters)
app.use("/api/report", ReportRouters)
app.use("/api/transaction", TransactionRouters)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));