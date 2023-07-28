import moment from "moment";
import { verifyToken } from "../helpers/token.js"

export async function verifyUser(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) throw ({ 
            type : "error",
            message : "Invalid Credential" 
        });

        const decoded = verifyToken(token);

        if (decoded?.roleId > 2) throw ({ 
            type : "error",
            message : "Unauthorized" 
        });
        
        req.user = decoded.id

        next();
    } catch (error) {
        return res.status(401).json({ 
            type : "error",
            message : error?.message, 
        })
    }
}

export async function verifyAdmin(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) throw ({ 
            type : "error",
            message : "Invalid Credential" 
        });

        const decoded = verifyToken(token);

        if (decoded?.roleId !== 1) throw ({ 
            type : "error",
            message : "Unauthorized" 
        });

        req.user = decoded.id

        next();
    } catch (error) {
        return res.status(403).json({ 
            type : "error", 
            message : error?.message, 
        })
    }
}

export async function verifyTokenResetPassword(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        verifyToken(token)

        next();
    } catch (error) {
        return res.status(403).json({ 
            type : "error", 
            message : error.message, 
        })
    }
}

