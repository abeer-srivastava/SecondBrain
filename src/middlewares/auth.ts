import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ValidateToken } from "../service/auth";


// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}


export function checkForAuthenticationCookie(req:Request,res:Response,next:NextFunction){
    
    const tokenCookieValue=req.cookies.token;
    if(!tokenCookieValue){
        return next();
    }
    try {
        const userPayload=ValidateToken(tokenCookieValue);
        req.user=userPayload;
    } catch (error) {
        console.error("Token validation error:", error);
    }
    next();
}