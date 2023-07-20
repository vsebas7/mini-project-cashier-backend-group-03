export const SOMETHING_WENT_WRONG = "Something went wrong";
export const UNAUTHORIZED = "Unauthorized";
export const UNVERIFIED = "Please verify your account"
export const USER_NOT_FOUND = "User not found";
export const USER_ALREADY_EXISTS = "User already exists";
export const USERNAME_ALREADY_EXISTS = "Username is taken";
export const EMAIL_ALREADY_EXISTS = "Email addres is taken";
export const PHONE_ALREADY_EXISTS = "Phone number is taken";
export const USER_DOES_NOT_EXISTS = "User does not exists";
export const INCORRECT_PASSWORD = "Password is incorrect";
export const INVALID_CREDENTIALS = "Invalid credentials";
export const BAD_REQUEST = "Bad request";

export const BLOG_ALREADY_EXISTS = "Blog is already exist"
export const DATA_NOT_FOUND = "Data not found";
export const BLOG_ALREADY_LIKE = "Blog is already like"

export const DEFAULT_ERROR_STATUS = 500;
export const BAD_REQUEST_STATUS = 400;
export const UNAUTHORIZED_STATUS = 401;
export const NOT_FOUND_STATUS = 404;

export default function errorHandler (error, req, res, next) {
    if (error?.name === "SequelizeValidationError") {
        return res.status(BAD_REQUEST_STATUS)
                    .json(
                        { message : error?.errors?.[0]?.message }
                    )
    }

    const message = error?.message || SOMETHING_WENT_WRONG;
    const status = error?.status || DEFAULT_ERROR_STATUS;
    const data = error?.data || null;
    res.status(status).json({ type : "error", status, message, data });
}