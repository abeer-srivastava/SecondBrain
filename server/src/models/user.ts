import mongoose,{Schema} from "mongoose";
import {randomBytes,createHmac} from "crypto"
import { createWebToken } from "../service/auth";

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    salt:{
        type:String,
        required:false
    }
});

userSchema.pre("save",function (next){
    const user=this;
    if(!user.isModified("password"))return next();
    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac("sha256",salt).update(user.password).digest("hex");
    this.salt=salt;
    this.password=hashedPassword;
    next();
});

userSchema.static("matchPasswordAndGenerateToken",async function(username,password){
    const user=await this.findOne({username});
    // console.log("user",user);
    // console.log("typeof",typeof user);
    if(!user){
        throw new Error("The User Is Not Registed");
    }
    const hashedPassword=user.password;
    const  salt=user.salt;
    const userGeneratedHash=createHmac("sha256",salt).update(password).digest("hex");

    if(hashedPassword!==userGeneratedHash){
        throw new Error("The Password Doesnot Match");
    }
    const token=createWebToken(user);
    // console.log(token);
    return token;
});


const User=mongoose.model("user",userSchema);
export default User;
