"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForAuthenticationCookie = checkForAuthenticationCookie;
const auth_1 = require("../service/auth");
function checkForAuthenticationCookie(req, res, next) {
    const tokenCookieValue = req.cookies.token;
    if (!tokenCookieValue) {
        return next();
    }
    try {
        const userPayload = (0, auth_1.ValidateToken)(tokenCookieValue);
        req.user = userPayload;
    }
    catch (error) {
        console.error("Token validation error:", error);
    }
    next();
}
