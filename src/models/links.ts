import mongoose from "mongoose";
import User from "./user";

const linkSchema=new mongoose.Schema({
    hash:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    }
});
const Link=mongoose.model("links",linkSchema);

export default Link;
