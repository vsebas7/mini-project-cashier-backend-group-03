import { Category, Product, ProductCategories } from "../../models/all_models.js"
import { ValidationError } from "yup"
import { Op, QueryTypes } from "sequelize";
import * as errorMiddleware from "../../middleware/error.handler.js"
import * as validation from "./validation.js"
import db from "../../models/index.js"
import cloudinary from "cloudinary"

export const allProduct = async( req, res, next) => {
    try {        
        const { page, product_name, id_cat, sort_price, sort_name } = req.query;

        const options = {
            offset: page > 1 ? parseInt(page - 1) * 10 : 0,
            limit : 10,
        }

        const filter = { id_cat, product_name }
        if(id_cat) filter.id_cat={'categoryId' : id_cat,}
        if(product_name) filter.product_name = {name: {[Op.like]: `%${product_name}%`}}
        
        let sort = []
        if(sort_price) sort.push(['price', sort_price])
        if(sort_name) sort.push(['name', sort_name])

        const products = await Product?.findAll({ 
            ...options,
            include:{
                model: ProductCategories,
                as : 'productCategory',
                where : filter.id_cat,
                attributes: ['categoryId'],
                include: [{
                    model: Category,
                    attributes:['name']
                }],
            },
            where : {
                [Op.and]: [
                    filter.product_name,
                    {'status' : 1}
                ]
            },
            order : sort
        });

        const total = id_cat || id_cat && page ? await products.length : await Product?.count();

        const pages = Math.ceil(total / options.limit);
    
        if(!products.length) throw ({ 
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : errorMiddleware.DATA_NOT_FOUND 
        });
        
        res.status(200).json({
            type: "success", 
            message: "Data berhasil dimuat", 
            product: {
                current_page: page ? page : 1,
                total_pages : pages,
                total_products : total,
                products_limit : options.limit,
                list : products,
            }
        })

    } catch (error) {
        next(error)
    }
}

export const addProduct = async (req, res, next) =>{
    const transaction = await db.sequelize.transaction()
    try {
        const { data } = req.body;
        
        if (!req.file) {
            return next ({ 
                type: "error",
                status: errorMiddleware.BAD_REQUEST_STATUS,
                message: "Please upload an image." 
            })
        }
        
        const body = JSON.parse(data)
        
        const { name, price, desc, category } = body
        
        await validation.AddProductValidationSchema.validate(body)
        
        const productExists = await Product?.findOne({ where : { name }})

        if(productExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_ALREADY_EXIST 
        })

        const product = await Product?.create({
            name,
            price,
            description : desc,
            image : req?.file?.filename,
            status : 1
        })

        const productCategoryIsExist = await ProductCategories.findAll({
            where : {
                productId : product.dataValues.id
            }
        })

        if(productCategoryIsExist) {
            ProductCategories.destroy({
                where : {
                    productId : product.dataValues.id
                }
            })
        }

        const categoryParent = await db.sequelize.query(
            `WITH RECURSIVE category_path (id, name, parent) AS
            (
                SELECT id, name, parent
                    FROM categories
                    WHERE id = ${category} 
                UNION ALL
                SELECT c.id, c.name, c.parent
                    FROM category_path AS cp JOIN categories AS c
                    ON cp.parent = c.id
            )
            SELECT * FROM category_path;`
        )

        const categoriesData = []

        for(let i = 0; i < categoryParent[0].length; i++){
            categoriesData.push({ 
                productId : product.dataValues.id,
                categoryId : categoryParent[0][i].id
            })
        }

        await ProductCategories.bulkCreate(categoriesData)

        res.status(200).json({ 
            type: "success", 
            message: "Produk berhasil ditambahkan",
            product : product
        });

        transaction.commit()
    } catch (error) {
        transaction.rollback()

        cloudinary.v2.api
            .delete_resources([`${req?.file?.filename}`],
                { type: 'upload', resource_type: 'image' })

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
        const { product_id } = req.params

        const product = await Product?.findOne({
            include:{
                model: ProductCategories,
                as : 'productCategory',
                attributes: ['categoryId'],
                include: [{
                    model: Category,
                    attributes:['name']
                }],
            }, 
            where : { 
                id : product_id 
            }
        })

        if(product.status !== 1) throw {
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.DATA_NOT_FOUND
        }

        if (!product) throw ({ 
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : errorMiddleware.DATA_NOT_FOUND 
        })

        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            product : [product]
        })
    } catch (error) {
        next(error)
    }
}

export const changeDetailProduct = async (req, res, next) =>{
    const transaction = await db.sequelize.transaction();
    try {
        const { product_id } = req.params

        const productIsExist = await Product?.findOne({ 
            where : { 
                id : product_id 
            }
        })

        if (!productIsExist) throw ({ 
            type : "error" ,
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : errorMiddleware.PRODUCT_NOT_FOUND 
        })
        
        const nameIsUsed = await Product?.findOne({
            where : {
                name : req.body.name,
                [Op.not]:[
                    {
                        id : product_id
                    }
                ]
            }
        })
        
        if(nameIsUsed) throw ({
            type : "error" ,
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PRODUCT_ALREADY_EXIST 
        })

        await validation.ChangeDetailProductValidationSchema.validate(req.body)
        
        const category = req.body.categoryId

        delete req.body.categoryId

        await Product?.update(
            req.body,
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
        
        const categoryParent = await Category?.findAll({
            where: {
                id : category
            }
        })
        
        let parent = categoryParent[0].dataValues.parent
        
        const listCaterogyParent = [ category ]
        
        while(parent !== null){
            let listCategory = await Category?.findAll({
                where: {
                    id : parent
                }
            })
            parent = listCategory[0].dataValues.parent
            
            listCaterogyParent.push(listCategory[0].dataValues.id)
        }
        
        const productCategoryIsExist = await ProductCategories.findAll({
            where : {
                productId : product.dataValues.id
            }
        })

        if(productCategoryIsExist) {
            ProductCategories.destroy({
                where : {
                    productId : product.dataValues.id
                }
            })
        }

        for(let i = 0; i < listCaterogyParent.length; i++){
            await ProductCategories.create({
                productId : product.dataValues.id,
                categoryId : listCaterogyParent[i]
            })
        }

        res.status(200).json({
            type : "success",
            message : "Produk detail berhasil diganti",
            product : product
        })

        await transaction.commit()
    } catch (error) {
        await transaction.rollback()

        next(error)
    }
}

export const changeImage = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
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
                .delete_resources([`${productExists?.dataValues?.image}`], 
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
            message : "Gambar produk berhasil diupload.", 
            imageUrl : req.file?.filename 
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        next(error)
    }
}

export const deleteProduct = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
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
        
        await Product?.update(
            { 
                status : 0
            }, 
            { 
                where : { 
                    id : product_id
                } 
            }
        )

        res.status(200).json({ 
            type : "success",
            message : "Produk berhasil dihapus.",
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        next(error)
    }
}