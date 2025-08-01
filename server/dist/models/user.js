"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = require("crypto");
const auth_1 = require("../service/auth");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: false
    }
});
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password"))
        return next();
    const salt = (0, crypto_1.randomBytes)(16).toString();
    const hashedPassword = (0, crypto_1.createHmac)("sha256", salt).update(user.password).digest("hex");
    this.salt = salt;
    this.password = hashedPassword;
    next();
});
userSchema.static("matchPasswordAndGenerateToken", function (username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findOne({ username });
        // console.log("user",user);
        // console.log("typeof",typeof user);
        if (!user) {
            throw new Error("The User Is Not Registed");
        }
        const hashedPassword = user.password;
        const salt = user.salt;
        const userGeneratedHash = (0, crypto_1.createHmac)("sha256", salt).update(password).digest("hex");
        if (hashedPassword !== userGeneratedHash) {
            throw new Error("The Password Doesnot Match");
        }
        const token = (0, auth_1.createWebToken)(user);
        // console.log(token);
        return token;
    });
});
const User = mongoose_1.default.model("user", userSchema);
exports.default = User;
