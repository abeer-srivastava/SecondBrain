"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebToken = createWebToken;
exports.ValidateToken = ValidateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = "@Beer123!";
function createWebToken(user) {
    const payload = {
        _id: user._id,
        username: user.username
    };
    const token = jsonwebtoken_1.default.sign(payload, secret);
    return token;
}
function ValidateToken(token) {
    const payload = jsonwebtoken_1.default.verify(token, secret);
    return payload;
}
