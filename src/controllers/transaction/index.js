import moment from "moment"
import { Product, Transaction } from "../../models/all_models.js"
import * as errorMiddleware from "../../middleware/error.handler.js"
import * as validation from "./validation.js"
import db from "../../models/index.js"
import { Transaction } from "sequelize"

export const invoiceTransaction = (transactionId) => {
    const createdInvoice = moment().format('YYYYMMDD')
    return `INV-${createdInvoice}${transactionId}`
}

// contoh INV-20230726123


// Cashier can add product to cart (before create transaction)
export const addProductToCart = async (req, res, next) => {
    const transaction = await db.sequelize.transaction()
    try {
        const { roleId } = req.user

        if(roleId !== 2) throw ({
            type : "error",
            status : errorMiddleware.UNAUTHORIZED,
            message : errorMiddleware.UNAUTHORIZED_STATUS
        })

        const { transactionId, productId } = req.body;

        if (!transactionId || !productId) throw {
            type : "error",
            status : errorMiddleware.BAD_REQUEST,
            message : errorMiddleware.BAD_REQUEST_STATUS
        }

        const productExists = await Product.findOne({
            where : {
                id : productId
            }
        })

        if(!productExists) {
            throw ({
                type : "error",
                status : errorMiddleware.NOT_FOUND,
                message : errorMiddleware.NOT_FOUND_STATUS
            })
        }

        // New entry for adding product to cart
        const productInCart = await db.Items.create({
            transactionId,
            productId,
            qty : 1,
            total_price : productExists.price
        })

        res.status(200).json({
            type: "success",
            message : `Berhasil menambahkan ${productExists.name} ke keranjang.`
        })

        await transaction.commit()
    }
    catch (error) {
        await transaction.rollback()
        
        next(error)
    }
}

// remove item from cart
export const removeFromCart = async (req, res, next) => {
    const transaction = await db.sequelize.transaction()
    try {
        const { roleId } = req.user
        
        if(roleId!== 2) throw ({
            type : "error",
            status : errorMiddleware.UNAUTHORIZED,
            message : errorMiddleware.UNAUTHORIZED_STATUS
        })

        const { transactionId, productId } = req.params;

        const exitingTransaction = await transaction.findOne({
            where: { id: transactionId, productId}
        })

        if(!exitingTransaction) {
            throw ({
                type : "error",
                status : errorMiddleware.NOT_FOUND,
                message : errorMiddleware.NOT_FOUND_STATUS
            })
        }

        // cek produk
        const exitingProduct = await Product.findOne({
                    where : {
                        id : productId
                    }
                })

        if(!exitingProduct) {
            throw {
                status: errorMiddleware.NOT_FOUND_STATUS,
                message: "Produk tidak ditemukan di keranjang"
            }
        }

        await Product.destroy({
            where: { id: productId, transactionId }, transaction
        })

        res.status(200).json({
            type: "success",
            message : "Berhasil menghapus product dari keranjang."
        })

        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        next(error)
    }

}

// update quantity in cart
export const updateCartItem = async (req, res, next) => {
    const transaction = await db.sequelize.transaction()
    try {
        const { roleId } = req.user
        
        if(roleId!== 2) throw ({
            type : "error",
            status : errorMiddleware.UNAUTHORIZED,
            message : errorMiddleware.UNAUTHORIZED_STATUS
        })

        const { transactionId, productId, qty } = req.params;

        const exitingCartItem = await transaction.findOne({
            where: { id: transactionId, productId}
        })

        if(!exitingCartItem) {
            throw ({
                type : "error",
                status : errorMiddleware.NOT_FOUND,
                message : errorMiddleware.NOT_FOUND_STATUS
            })
        }

        // Update item quantity in cart
        // Belum selesai
        if (qty > 0) {
            await Product.update(
                {qty: qty}, 
                {
                where: { id: productId, transactionId }, transaction
                })
        } else {
            await Product.destroy({
                where: { id: productId, transactionId }, transaction
            })
        }

        await transaction.commit()

        res.status(200).json({
            type: "success",
            message: "Berhasil update jumlah produk di keranjang"
        })

    } catch (error) {
        await transaction.rollback()
            next(error)
    }
}

// checkout transaction
export const checkout = async (req, res, next) => {
    const transaction = await db.sequelize.transaction()
    try {
        const { roleId } = req.user
        
        if(roleId!== 2) throw ({
            type : "error",
            status : errorMiddleware.UNAUTHORIZED,
            message : errorMiddleware.UNAUTHORIZED_STATUS
        })

        const { transactionId } = req.params;

        const cartItems = await Transaction?.findAll({
            where: { transactionId },
            attributes : ['total_price', 'qty']
        })

    } catch (error) {}
}