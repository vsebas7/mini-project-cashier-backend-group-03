import { Product, ProductCategories, Category, Items, Transaction } from "../../models/all_models.js";
import { Op, QueryTypes } from "sequelize";
import * as errorMiddleware from "../../middleware/error.handler.js"
import moment from "moment";
import db from "../../models/index.js";

export const invoiceTransaction = (transactionId) => {
    const createdInvoice = moment().format('YYYYMMDD')
    return `INV-${createdInvoice}${transactionId}`
}

// contoh INV-20230726123

// hapus jika tidak diperlukan
export const addItemToCart = async (req, res, next) => {
    try {
        const { roleId } = req.user

        if(roleId !== 2) throw ({
            type: "error",
            status: errorMiddleware.UNAUTHORIZED,
            message: errorMiddleware.UNAUTHORIZED_STATUS
        })

        const { productId, qty } = req.body;
    
        // Check if the product exists and is active
        const existingProduct = await Product.findOne({
            where: {
            id: productId,
            status: 1,
            },
        });
    
        if (!existingProduct) throw ({
            type: "error",
            status: errorMiddleware.BAD_REQUEST_STATUS,
            message: "Product not found or inactive",
        });
    
        // Check if the product is already in the cart
        const existingCartItem = await Items.findOne({
            where: {
                transactionId: null, 
                productId: productId,
            },
        });
    
        if (existingCartItem) {
                const updatedQuantity = existingCartItem.qty + qty;
                await existingCartItem.update({
                qty: updatedQuantity,
                total_price: existingProduct.price * updatedQuantity,
            });
        } else {
                const totalPrice = existingProduct.price * qty;
                await Items.create({
                productId: productId,
                qty: qty,
                total_price: totalPrice,
            });
        }
    
        res.status(200).json({
            type: "success",
            message: "Product added to cart successfully",
        });
    } catch (error) {
        next(error);
    }
};

