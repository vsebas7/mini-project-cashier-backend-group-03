import moment from "moment"
import { Transaction } from "../../models/all_models.js"
import * as errorMiddleware from "../../middleware/error.handler.js"
import moment from "moment";
import db from "../../models/index.js";

export const invoiceTransaction = (transactionId) => {
    const createdInvoice = moment().format('YYYYMMDD')
    return `INV-${createdInvoice}${transactionId}`
} // contoh INV-20230726123


// add product to cart
export const addToCart = async (req, res, next) => {
    const transaction = await db.sequelize.transaction()
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

// belum diujicoba
export const createTransaction = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        // Get all items in the cart
        const cartItems = await Items.findAll({
            where: {
                transactionId: null, 
            },
            include: {
                model: Product,
                attributes: ["name", "price"],
            },
        });
    
        if (cartItems.length === 0) {
            throw {
                type: "error",
                status: errorMiddleware.BAD_REQUEST_STATUS,
                message: "Cart is empty. Add items before creating a transaction.",
            };
        }
    
        // Calculate the total price of the transaction? Is it needed?
        let totalPrice = 0;
        for (const cartItem of cartItems) {
            totalPrice += cartItem.total_price;
        }
    
        // Create a new transaction with the items in the cart
        const newTransaction = await Transaction.create(
            {
                invoice: invoiceTransaction(),
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                userId: req.user.id,
                total_price: totalPrice,
                items: cartItems,
            },
            {
                include: {
                    model: Items,
            },
                transaction,
            }
        );
    
        // Update the items to link them to the transaction
        for (const cartItem of cartItems) {
            await cartItem.update({
                transactionId: newTransaction.id,
            },
            { transaction }
            );
        }
    
        await transaction.commit();
    
        res.status(200).json({
            type: "success",
            message: "Transaction created successfully",
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}