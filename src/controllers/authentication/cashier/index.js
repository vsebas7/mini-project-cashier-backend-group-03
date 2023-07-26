import * as validation from "./validation.js"
import * as errorMiddleware from "../../../middleware/error.handler.js"
import db from "../../../models/index.js"
import moment from "moment";
import * as encryption from "../../../helpers/encryption.js"
import * as tokenHelper from "../../../helpers/token.js"

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        await validation.LoginValidationSchema.validate(req.body);

        const userExists = await db.User.findOne(
            {
                where: {username}
            }
        );

        if (!userExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USER_DOES_NOT_EXISTS 
        })
        
        const isPasswordCorrect = encryption.comparePassword(password, userExists?.dataValues?.password);

        if (!isPasswordCorrect) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS,
            message : errorMiddleware.INCORRECT_PASSWORD 
        });
        
        const accessToken = tokenHelper.createTokenLogin({ 
            id: userExists?.dataValues?.id, 
            username : userExists?.dataValues?.username,
            roleId : userExists?.dataValues?.roleId
        });
        
        delete userExists?.dataValues?.password;

        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({ 
                type : "success",
                user : userExists 
            })

    } catch (error) {
        if (error instanceof validation.ValidationError) {
            return next({ 
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

export const keepLogin = async (req, res, next) => {
    try {
        const users = await db.User.findAll(
            { 
                where : {
                    id : req.user.id
                },
                attributes : {
                    exclude : ["password"]
                }
            }
        );

        res.status(200).json({ 
            type : "success",
            users : users
        })
    } catch (error) {
        next(error)
    }
}

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        await validation.EmailValidationSchema.validate(req.body);

        const isUserExist = await db.User.findOne(
            { where : { email } }
        );

        if (!isUserExist) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USER_DOES_NOT_EXISTS 
        })

        const accessToken = tokenHelper.createToken({ 
            id : isUserExist?.dataValues?.id,
            username : isUserExist?.dataValues?.username,
            token_created : moment().format("YYYY-MM-DD HH:mm:ss")
        });

        await db.User.update(
            { 
                token : accessToken,
                expired_token : moment().add(10, "minutes").format("YYYY-MM-DD HH:mm:ss")
            }, 
            { 
                where : { 
                    id : isUserExist?.dataValues?.id
                } 
            }
        )

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");

        const message  = handlebars.compile(template)({ link : `http://localhost:3000/reset-password/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Reset Password",
            html: message
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            type : "success",
            message : "Check Your Email to Reset Your Password"
        })
    } catch (error) {
        if (error instanceof validation.ValidationError) {
            return next({ 
                status : errorMiddleware.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

export const resetPassword = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { password } = req.body;

        await validation.resetPasswordSchema.validate(req.body);

        const userExists = await db.User.findOne(
            {
                where: 
                {
                    id : req.user.id
                },
                attributes : {
                    exclude : ["token","expired_token"]
                } 
            }
        );

        if (!userExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USER_DOES_NOT_EXISTS 
        })

        const hashedPassword = encryption.hashPassword(password);

        await db.User.update(
            { 
                password: hashedPassword,
                token : null,
                expired_token : null 
            }, 
            { 
                where: {
                    id: req.user.id
                }
            }
        );

        res.status(200).json({
            type : "success",
            message : "Reset Password Success, Please Login Again"
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof validation.ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}
