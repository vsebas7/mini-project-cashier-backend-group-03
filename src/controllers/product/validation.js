import * as Yup from "yup"

export const AddProductValidationSchema = Yup.object({
    name : Yup.string().required("Product name is required"), 
    price : Yup.number().required("Product price is required"), 
    category : Yup.number().required("Product category is required and must be a number "), 
    desc :  Yup.string().required("Product description is required")
})

export const ChangeDetailProductValidationSchema = Yup.object({
    name : Yup.string(),
    price : Yup.number("Product price and must be a number"),
    categoryId : Yup.number("Product stock and must be a number"),
    description : Yup.string(),
    image : Yup.string()
})