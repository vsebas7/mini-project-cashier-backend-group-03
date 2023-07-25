import { Category, Product, ProductCategories } from "../../models/all_models.js"
import { ValidationError } from "yup"
import { Op } from "sequelize";
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
        console.log(filter)
        
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

        for(let i = 0; i < listCaterogyParent.length; i++){
            await ProductCategories.create({
                productId : product.dataValues.id,
                categoryId : listCaterogyParent[i]
            })
        }

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
            product : product
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

export const allCategory = async (req, res, next) => {
    try {
        const category = await Category?.findAll({
            where: {
                status : req.query.status ? req.query.status : 1
            }
        })

        if(!category.length) throw ({
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.DATA_NOT_FOUND
        })

        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            category : category
        })

    } catch (error) {
        next(error)
    }
}

export const addCategory = async (req, res, next) => {
    try {
        await validation.AddCategoryValidationSchema.validate(req.body);

        const categoryIsExists = await Category?.findAll({
            where : {
                name : req.body.name
            }
        })

        if(categoryIsExists.length) throw({
            type : "error",
            status : errorMiddleware.BAD_REQUEST_STATUS,
            message : errorMiddleware.CATEGORY_ALREADY_EXIST
        })

        req.body.status = 1

        const category = await Category.create( req.body )
        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            category : category
        })

    } catch (error) {
        next(error)
    }
}

export const changeDetailCategory = async (req, res, next) => {
    try {
        await validation.ChangeCategoryDetailValidationSchema.validate(req.body);

        const categoryIsExist = await Category?.findOne({
            where : {
                id : req.params.category_id
            }
        })

        if(!categoryIsExist) throw ({
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.CATEGORY_NOT_FOUND
        })

        const categoryNameIsExist = await Category?.findOne({
            where : {
                name : req.body.name,
                [Op.not]:[
                    {
                        id : req.params.category_id
                    }
                ]
            }
        })

        if(categoryNameIsExist) throw ({
            type : "error",
            status : errorMiddleware.BAD_REQUEST_STATUS,
            message : errorMiddleware.CATEGORY_ALREADY_EXIST
        })

        if(req.params.category_id === req.body.parent) throw ({
            type : "error",
            status : errorMiddleware.BAD_REQUEST_STATUS,
            message : errorMiddleware.BAD_REQUEST
        })

        await Category.update(
            req.body, 
            { 
                where : { 
                    id : req.params.category_id
                } 
            }
        )

        const category = await Category?.findOne({
            where : { 
                id : req.params.category_id
            } 
        })

        res.status(200).json({
            type : "success",
            message : "Category detail berhasil diganti",
            category 
        })

    } catch (error) {
        next(error)
    }
}

export const parentCategory = async (req, res, next) => {
    try {
        const parent = await Category?.findAll({
            where : {
               [Op.not]:[
                { parent : null },
                { status : 1 }
               ]
            },
            attributes : {
                exclude : ["status"]
            }
        })

        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            category : parent
        })
    } catch (error) {
        next(error)
    }
}

export const deleteCategory = async (req, res, next) => {
    try {

        const categoryIsExist = await Category?.findAll({
            where : {
               id : req.params.category_id
            }
        })

        const categoryIsDeleted = await Category?.findOne({
            where : {
                status : 0,
                id : req.params.category_id
            }
        })

        if(categoryIsDeleted || !categoryIsExist.length) throw ({
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.CATEGORY_NOT_FOUND
        })

        await Category?.update(
            {
                status : 0
            },
            {
                where : {
                    id : req.params.category_id
                }
            }
        )

        res.status(200).json({
            type : "success",
            message : "Category berhasil dihapus",
        })
    } catch (error) {
        next(error)
    }
}

export const restoreCategory = async (req, res, next) => {
    try {

        const categoryIsExist = await Category?.findAll({
            where : {
               id : req.params.category_id
            }
        })

        const categoryIsAvailable = await Category?.findOne({
            where : {
                status : 1,
                id : req.params.category_id
            }
        })

        if(categoryIsAvailable || !categoryIsExist.length) throw ({
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.CATEGORY_NOT_FOUND
        })

        await Category?.update(
            {
                status : 1
            },
            {
                where : {
                    id : req.params.category_id
                }
            }
        )

        res.status(200).json({
            type : "success",
            message : "Category berhasil dikembalikan",
        })
    } catch (error) {
        next(error)
    }
}