import * as Yup from "yup"

export const AddProductValidationSchema = Yup.object({
    name : Yup.string().required("Product name is required"), 
    price : Yup.number().required("Product price is required"), 
    stock : Yup.number().required("Product stock is required"), 
    category : Yup.number().required("Product category is required and must be a number "), 
    desc :  Yup.string().required("Product description is required")
})

export const ChangeNameValidationSchema = Yup.object({
    name : Yup.string().required("Product name is required")
})

export const ChangePriceValidationSchema = Yup.object({
    price : Yup.number().required("Product price is required")
})

export const ChangeDescValidationSchema = Yup.object({
    desc : Yup.string().required("Product description is required")
})

export const ChangeCategoryValidationSchema = Yup.object({
    category : Yup.number().required("Product category is required and must be a number")
})

export const AddCategoryValidationSchema = Yup.object({
    name : Yup.string().required("Category name is required"),
    sub_category : Yup.number("Sub-category must be a number")
})

export const ChangeCategoryNameValidationSchema = Yup.object({
    name : Yup.string().required("Category name is required"),
    category_id : Yup.number().required("Category ID is required")
})

export const CategoryIDValidationSchema = Yup.object({
    category_id : Yup.number().required("Category ID is required")
})

export const ChangeCategoryStatusValidationSchema = Yup.object({
    status : Yup.string().required("Category Status is required"),
    category_id : Yup.number().required("Category ID is required")
})
