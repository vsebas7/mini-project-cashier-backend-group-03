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