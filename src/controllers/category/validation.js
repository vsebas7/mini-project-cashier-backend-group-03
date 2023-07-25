import * as Yup from "yup"

export const AddCategoryValidationSchema = Yup.object({
    name : Yup.string().required("Category name is required"),
    parent : Yup.number("Sub-category must be a number")
})

export const ChangeCategoryDetailValidationSchema = Yup.object({
    name : Yup.string(),
    parent : Yup.number("Sub-Category must be a number"),
})