import { Product } from "../../models/all_models.js"
import * as errorMiddleware from "../../middleware/error.handler.js"
import db from "../../models/index.js"
import moment from "moment";
import { Op } from "sequelize";

export const allProduct = async( req, res, next) => {
    try {
        const { 
            page, 
            product_name, 
            id_cat, 
            sort_price,
            sort_name
        } = req.query;

        const options = {
            offset: page > 1 ? parseInt(page - 1) * limit : 0,
            limit: 10,
        }

        const filter = {}
        if(id_cat) filter.categoryId = id_cat
        if(product_name) filter.name = {[Op.like]: `%${product_name}%`}
        
        let sort = []
        if(sort_price) sort.push(['price', sort_price])
        if(sort_name) sort.push(['name', sort_name])

        const products = await Product?.findAll({ 
            ...options,
            where : filter,
            order : sort
        })

        const total = id_cat || id_cat && page ? await Product?.count({where: {categoryId : id_cat}}) : await Product?.count();

        const pages = Math.ceil(total / options.limit);
    
        if(!products.length) throw ({ 
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : errorMiddleware.DATA_NOT_FOUND 
        });
        
        res.status(200).json({
            type: "success", 
            message: "Data berhasil dimuat", 
            data: {
                current_page: page ? page : 1,
                total_pages : pages,
                total_products : total,
                products_limit : options.limit,
                products,
            } 
        })

    } catch (error) {
        next(error)
    }
}