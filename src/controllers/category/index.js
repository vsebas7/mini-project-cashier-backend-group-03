import { Category } from "../../models/all_models.js"
import { Op, QueryTypes } from "sequelize";
import * as errorMiddleware from "../../middleware/error.handler.js"
import * as validation from "./validation.js"
import db from "../../models/index.js"

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

export const subCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.query

        if(!Number(categoryId) && !categoryId ) throw ({
            type : "error",
            status : errorMiddleware.BAD_REQUEST_STATUS,
            message : errorMiddleware.BAD_REQUEST
        })

        const listCategory =  await db.sequelize.query(
            `WITH RECURSIVE category_path (id, name, parent) AS
            (
                SELECT id, name, parent
                    FROM categories
                    WHERE id = ${categoryId}
                UNION ALL
                SELECT c.id, c.name, c.parent
                    FROM category_path AS cp JOIN categories AS c
                    ON cp.parent = c.id
            )
            SELECT * FROM category_path;`, 
            { type: QueryTypes.SELECT }
        )
        
        if(!listCategory.length) throw ({
            type : "error",
            status : errorMiddleware.NOT_FOUND_STATUS,
            message : errorMiddleware.DATA_NOT_FOUND
        })

        res.status(200).json({
            type : "success",
            message : "Data berhasil dimuat",
            category : listCategory
        })
    } catch (error) {
        next(error)
    }
}

export const deleteCategory = async (req, res, next) => {
    try {

        const { categoryId } = req.params

        if(!Number(categoryId) && !categoryId ) throw ({
            type : "error",
            status : errorMiddleware.BAD_REQUEST_STATUS,
            message : errorMiddleware.BAD_REQUEST
        })

        const categoryIsExist = await Category?.findAll({
            where : {
               id : categoryId
            }
        })

        const categoryIsDeleted = await Category?.findOne({
            where : {
                status : 0,
                id : categoryId
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
                    id : categoryId
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