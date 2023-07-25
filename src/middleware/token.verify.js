import { verifyToken } from "../helpers/token.js"

export async function verifyUser(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token);
        if (decoded?.roleId > 2) throw ({ 
            type : "error",
            message : "Unauthorized" 
        });
        next();
    } catch (error) {
        return res.status(401).json({ 
            type : "error",
            message : "Unauthorized" 
        })
    }
}

export async function verifyAdmin(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw ({ 
            type : "error",
            message : "Unauthorized" 
        });
        const decoded = verifyToken(token);

        if (decoded?.roleId !== 1) throw ({ 
            type : "error",
            message : "Unauthorized" 
        });

        next();
    } catch (error) {
        return res.status(403).json({ 
            type : "error", 
            message : error?.message, 
            data : null  
        })
    }
}
