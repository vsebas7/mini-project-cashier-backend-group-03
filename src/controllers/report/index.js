import * as model from "../../models/all_models.js"
import { Op,QueryTypes } from "sequelize";
import * as errorMiddleware from "../../middleware/error.handler.js"
import db from "../../models/index.js"
import moment from "moment"

export const allTransaction = async (req, res, next) => {
    try {
        const {startFrom, endFrom, page} = req.query

        const filter = {}

        const options = {
            offset: page > 1 ? parseInt(page - 1) * 10 : 0,
            limit : 10
        }
        
        if(req.query.startFrom) {
            filter.created_at = {
                [Op.gte]: moment(startFrom).format("YYYY-MM-DD HH:mm:ss"),
                [Op.lte]: moment(endFrom).add(1,"days").format("YYYY-MM-DD HH:mm:ss"),
            }
        }

        const transaction = await model.Transaction.findAll({
            ...options,
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
                        }
                    }
                }
            },
            where : filter,
            order : [
                ['created_at','DESC']
            ]
        })

        const total = filter ? await model.Transaction?.count({where: filter}) :  await model.Transaction?.count();

        const pages = Math.ceil(total / options.limit);
        
        console.log(total / options.limit)

        if(!transaction.length) throw ({ 
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : errorMiddleware.DATA_NOT_FOUND 
        });

        res.status(200).json({
            type: "success", 
            message: "Data berhasil dimuat", 
            report: {
                currentPage: page ? page : 1,
                totalPage : pages,
                total_transaction : total,
                transaction_limit : options.limit,
                report : transaction
            }
        })

    } catch (error) {
        next(error)
    }
}

export const transactionReport = async (req, res, next) => {
    try {
        const {startFrom, endFrom} = req.query

        const filter = {}
        
        if(req.query.startFrom) {
            filter.created_at = {
                [Op.gte]: moment(startFrom).format("YYYY-MM-DD HH:mm:ss"),
                [Op.lte]: moment(endFrom).add(1,"days").format("YYYY-MM-DD HH:mm:ss"),
            }
        }

        const transaction =  await db.sequelize.query(
            `SELECT 
                SUM(total_price) as total, 
                DATE_Format(created_at,'%Y-%m-%d') as tanggal 
            FROM mini_project_cashier.transactions
            GROUP BY tanggal
            ${startFrom ? `HAVING tanggal BETWEEN '${startFrom}' AND '${endFrom}'` : ""}
            ORDER BY tanggal ASC;`, 
            { type: QueryTypes.SELECT }
        )

        res.status(200).json({
            type: "success", 
            message: "Data berhasil dimuat", 
            report: transaction
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