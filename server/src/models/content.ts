import mongoose from "mongoose";
import Tag from "./tags";
import User from "./user";
export const contentType=["tweet","video","article","document","links"] as const ;
export const contentSchema=new mongoose.Schema({
    link:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        enum:contentType,
        required:true
    },
    title:{
        type:String,
        required:true,
    },
    tags:[{
        type:mongoose.Types.ObjectId,
        ref:"Tag"
    }],
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },shareLink:{
        type:String,
        unique:true,
        sparse:true
    }
},{timestamps:true});

// pre()=>used to hash the passwords and perfrom something that needs to be perfromed before the creation of the model

contentSchema.pre("save",async function(next){
    const user=await User.findById(this.userId);
    if(!user){
        throw new Error("User does not exist ");
    }
    next();
})

const Content=mongoose.model("content",contentSchema);

export default Content;