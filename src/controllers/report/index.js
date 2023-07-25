import * as model from "../../models/all_models.js"
import { Op } from "sequelize";
import * as errorMiddleware from "../../middleware/error.handler.js"
import * as validation from "./validation.js"
import db from "../../models/index.js"
import moment from "moment"

export const allTransaction = async (req, res, next) => {
    try {
        const {startFrom, endFrom} = req.query

        const filter = {}
        
        if(req.query.startFrom) {
            filter.created_at = {
                [Op.gte]: moment(startFrom).format("YYYY-MM-DD HH:mm:ss"),
                [Op.lte]: moment(endFrom).add(1,"days").format("YYYY-MM-DD HH:mm:ss"),
            }
        }

        const transaction = await model.Transaction.findAll({
            include : {
                model : model.Items,
                attributes : ['total_price','qty'],
                include : {
                    model : model.Product,
                    attributes : ['name','price','image'],
                    include : {
                        model : model.ProductCategories,
                        as : 'productCategory',
                        attributes : ['categoryId'],
                        include : {
                            model : model.Category,
                            attributes : ['name'],
                            where : {
                                id : 3
                            }
                        }
                    }
                }
            },
            where : filter,
            order : [
                ['created_at','ASC']
            ]
        })

        if(!transaction.length) throw ({
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.DATA_NOT_FOUND
        })

        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            data : transaction
        })

    } catch (error) {
        next(error)
    }
}

export const detailTransaction = async (req, res, next) => {
    try {
        const item = await model.Items.findAll({
            where : {
                transactionId : req.params.transaction_id
            },
            attributes:['created_at','qty','total_price'],
            include : {
                model : model.Product,
                attributes : {
                    exclude : ['descripstion','status']
                }
            }
        })

        if(!item) throw ({
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.DATA_NOT_FOUND
        })

        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            detail : item
        })

    } catch (error) {
        next(error)
    }
}