import { Product } from "../../models/all_models.js"
import { ValidationError } from "yup"
import { Op } from "sequelize";
import * as errorMiddleware from "../../middleware/error.handler.js"
import * as validation from "./validation.js"
import * as config from "../../config/index.js"
import db from "../../models/index.js"
import moment from "moment";


export const allProduct = async( req, res, next) => {
    try {
        // const { roleId } = req.user;
        
        // if(roleId !== 1 ) throw ({ 
        //     type : "error",
        //     status : errorMiddleware.UNAUTHORIZED, 
        //     message : errorMiddleware.UNAUTHORIZED_STATUS 
        // });
        
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

export const addProduct = async (req, res, next) =>{
    const transaction = await db.sequelize.transaction()
    try {
        // const { roleId } = req.user;
        
        // if(roleId !== 1 ) throw ({ 
        //     type : "error",
        //     status : errorMiddleware.UNAUTHORIZED, 
        //     message : errorMiddleware.UNAUTHORIZED_STATUS 
        // });
        
        const { data } = req.body;

        if (!req.file) {
            return next ({ 
                type: "error",
                status: errorMiddleware.BAD_REQUEST_STATUS,
                message: "Please upload an image." 
            })
        }

        const body = JSON.parse(data)

        const { name, price, stock, category, desc } = body
        
        await validation.AddProductValidationSchema.validate(req.body)

        const productExists = await Product?.findOne({ where : { name }})

        if(productExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_ALREADY_EXIST 
        })

        const product = await Product?.create({
            name,
            price,
            stock,
            categoryId : category,
            description : desc,
            // image : req?.file?.filename
        })

        res.status(200).json(
            { 
                type: "success", 
                message: "Product added",
                product : product
            }
        );

        transaction.commit()
    } catch (error) {
        transaction.rollback()

        // cloudinary.v2.api
        //     .delete_resources([`${req?.file?.filename}`],
        //         { type: 'upload', resource_type: 'image' })

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error
            })
        }

        next(error)
    }
}

export const productDetails = async (req, res, next) =>{
    try {
        const { roleId } = req.user;
        
        if(roleId !== 1 ) throw ({ 
            type : "error",
            status : errorMiddleware.UNAUTHORIZED, 
            message : errorMiddleware.UNAUTHORIZED_STATUS 
        });

        const { product_id } = req.params

        const product = await Product?.findOne({ 
            where : { 
                id : product_id 
            }
        })

        if (!product) throw ({ 
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : errorMiddleware.DATA_NOT_FOUND 
        })

        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            product : product
        })
    } catch (error) {
        next(error)
    }
}

export const changeName = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { roleId } = req.user;
        
        if(roleId !== 1 ) throw ({ 
            type : "error",
            status : errorMiddleware.UNAUTHORIZED, 
            message : errorMiddleware.UNAUTHORIZED_STATUS 
        });
        
        const { product_id, name } = req.query;
        
        await validation.ChangeNameValidationSchema.validate(req.query);
        
        const productExists = await Product?.findOne({ where : { name }})
        
        if(productExists) throw ({ 
            type: "error",
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_ALREADY_EXIST 
        })

        await Product?.update(
            {
                name
            },
            {
                where : 
                {
                    id : product_id
                }
            }
        )

        const product = await Product?.findOne({ 
            where : { 
                id : product_id 
            }
        })

        res.status(200).json({ 
            type : "success",
            message : "Changed product name success",
            product
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}

export const changePrice = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { roleId } = req.user;
        
        if(roleId !== 1 ) throw ({ 
            type : "error",
            status : errorMiddleware.UNAUTHORIZED, 
            message : errorMiddleware.UNAUTHORIZED_STATUS 
        });
        
        const { product_id, price } = req.query;
        
        const productExists = await Product?.findOne({ 
            where : { 
                id : product_id
            }
        })
        
        if(!productExists) throw ({ 
            type: "error",
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_NOT_FOUND 
        })

        await validation.ChangePriceValidationSchema.validate(req.query);

        await Product?.update(
            {
                price
            },
            {
                where : 
                {
                    id : product_id
                }
            }
        )

        const product = await Product?.findOne({ 
            where : { 
                id : product_id 
            }
        })

        res.status(200).json({ 
            type : "success",
            message : "Changed product price success",
            product
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}

export const changeDesc = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { roleId } = req.user;
        
        if(roleId !== 1 ) throw ({ 
            type : "error",
            status : errorMiddleware.UNAUTHORIZED, 
            message : errorMiddleware.UNAUTHORIZED_STATUS 
        });
        
        const { product_id, desc } = req.query;
        
        const productExists = await Product?.findOne({ 
            where : { 
                id : product_id
            }
        })
        
        if(!productExists) throw ({ 
            type: "error",
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_NOT_FOUND 
        })

        console.log(!productExists)

        await validation.ChangeDescValidationSchema.validate(req.query);

        await Product?.update(
            {
                description : desc
            },
            {
                where : 
                {
                    id : product_id
                }
            }
        )
        
        const product = await Product?.findOne({ 
            where : { 
                id : product_id 
            }
        })

        res.status(200).json({ 
            type : "success",
            message : "Changed product description success",
            product
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}

export const changeCategory = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { roleId } = req.user;
        
        if(roleId !== 1 ) throw ({ 
            type : "error",
            status : errorMiddleware.UNAUTHORIZED, 
            message : errorMiddleware.UNAUTHORIZED_STATUS 
        });
        
        const { product_id, category } = req.query;

        const productExists = await Product?.findOne({ 
            where : { 
                id : product_id
            }
        })
        
        if(!productExists) throw ({ 
            type: "error",
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_NOT_FOUND 
        })
        
        await validation.ChangeCategoryValidationSchema.validate(req.query);

        await Product?.update(
            {
                categoryId : category
            },
            {
                where : 
                {
                    id : product_id
                }
            }
        )

        const product = await Product?.findOne({ 
            where : { 
                id : product_id 
            }
        })

        res.status(200).json({ 
            type : "success",
            message : "Changed product category success",
            product
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}

export const changeImage = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        // const { roleId } = req.user;
        
        // if(roleId !== 1 ) throw ({ 
        //     type : "error",
        //     status : errorMiddleware.UNAUTHORIZED, 
        //     message : errorMiddleware.UNAUTHORIZED_STATUS 
        // });

        const { product_id } = req.params

        const productExists = await Product?.findOne({ 
            where : { 
                id : product_id
            }
        })
        
        if(!productExists) throw ({ 
            type: "error",
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_NOT_FOUND 
        })
        
        if (!req.file) {
            return next ({ 
                status: errorMiddleware.BAD_REQUEST_STATUS,
                message: "Please upload an image." 
            })
        }
        
        if(productExists?.dataValues?.image){
            cloudinary.v2.api
                .delete_resources([`${user?.dataValues?.image}`], 
                    { type: 'upload', resource_type: 'image' })
                .then(console.log);
        }

        await Product?.update(
            { 
                image : req?.file?.filename 
            }, 
            { 
                where : { 
                    id : product_id
                } 
            }
        )

        res.status(200).json({ 
            type : "success",
            message : "Change product image success.", 
            imageUrl : req.file?.filename 
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        next(error)
    }
}

export const changeStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { roleId } = req.user;
        
        if(roleId !== 1 ) throw ({ 
            type : "error",
            status : errorMiddleware.UNAUTHORIZED, 
            message : errorMiddleware.UNAUTHORIZED_STATUS 
        });

        const { product_id, status } = req.query

        const productExists = await Product?.findOne({ 
            where : { 
                id : product_id
            }
        })
        
        if(!productExists) throw ({ 
            type: "error",
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_NOT_FOUND 
        })
        
        await Product?.update(
            { 
                status
            }, 
            { 
                where : { 
                    id : product_id
                } 
            }
        )

        const product = await Product?.findOne({ 
            where : { 
                id : product_id 
            }
        })

        res.status(200).json({ 
            type : "success",
            message : "Change product status success.",
            product : product
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        next(error)
    }
}


