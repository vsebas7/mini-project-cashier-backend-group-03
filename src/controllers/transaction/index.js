import moment from "moment"
import { Op, QueryTypes } from "sequelize"
import { Transaction, Items } from "../../models/all_models.js"
import * as errorMiddleware from "../../middleware/error.handler.js"
import db from "../../models/index.js";

export const generateInvoice = (transactionId) => {
    const createdInvoice = moment().format('YYYYMMDD')
    return `INV-${createdInvoice}${transactionId}`
} // contoh INV-20230726123

// hapus jika tidak diperlukan
// export const addItemToCart = async (req, res, next) => {
//     try {
//         const { productId, qty } = req.body;
    
//         // Check if the product exists and is active
//         const existingProduct = await Product.findOne({
//             where: {
//             id: productId,
//             status: 1,
//             },
//         });
    
//         if (!existingProduct) throw ({
//             type: "error",
//             status: errorMiddleware.BAD_REQUEST_STATUS,
//             message: "Product not found or inactive",
//         });
    
//         // Check if the product is already in the cart
//         const existingCartItem = await Items.findOne({
//             where: {
//                 transactionId: null, 
//                 productId: productId,
//             },
//         });
    
//         if (existingCartItem) {
//                 const updatedQuantity = existingCartItem.qty + qty;
//                 await existingCartItem.update({
//                 qty: updatedQuantity,
//                 total_price: existingProduct.price * updatedQuantity,
//             });
//         } else {
//             const totalPrice = existingProduct.price * qty;
//             await Items.create({
//                 productId: productId,
//                 qty: qty,
//                 total_price: totalPrice,
//             });
//         }
    
//         res.status(200).json({
//             type: "success",
//             message: "Product added to cart successfully",
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// memulai transaksi di tabel Transactions
export const addItemToCart = async (req, res, next) => {
    const transaction = await db.sequelize.transaction()

    try {
        const { transactionId, productId, qty, total_price } = req.body

        await Items.create ({
            created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            transactionId: transactionId,
            productId: productId,
            qty: qty,
            total_price: total_price,
        }, {transaction})

        await transaction.commit()

        res.status(200).json({
            type: "success",
            message: "Success yeah"
        })
    } catch (error) {
        await transaction.rollback()
        next(error)
    }
}

export const removeItemFromCart = async (req, res, next) => {
    const transaction = await db.sequelize.transaction()

    try {
        const {itemId} = req.params

        //  Mencari cart item dengan itemId (id di transaction_item)
        const cartItem = await Items.findByPk(itemId)

        if (!cartItem) throw {
            type: "erorr",
            message: "Sorry, cart item can not be found"
        }

        // Menghapus isi kolom cart item dari tabel transaction_item
        await cartItem.destroy({ transaction})

        await transaction.commit()

        res.status(200).json({
            type: "success",
            message: "Selamat, item produk telah lenyap." //please change it later
        })
    } catch (error) {
        await transaction.rollback()

        next(error)
    }
}

// akhir dari transaksi di tabel Transactions

export const createTransaction = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    
    try {

        const { userId, total_price } = req.body
        
        // Create a new transaction
        const newTransaction = await Transaction.create(
            {
                invoice: generateInvoice(),
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                userId: userId,
                total_price: total_price,
            },
            { transaction }
        );

        
        // Generate invoice based on the new transaction's id?
        const invoice = generateInvoice(newTransaction.id)

        await newTransaction.update({
            invoice : invoice,
        }, { transaction }
        )

        // Update the items to link them to the transaction?
        // const cartItems = await Items.findAll({
        //     where: {
        //     transactionId: null,
        //     },
        // });
    
        // for (const cartItem of cartItems) {
        //     await cartItem.update(
        //     {
        //         transactionId: newTransaction.id,
        //     },
        //     { transaction }
        //     );
        // }

        await transaction.commit();

        res.status(200).json({
            type: "success",
            message: "Transaction created successfully",
            data: newTransaction
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}