import mongoose, { mongo } from "mongoose";



export const tagSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:false
    }
});

export const Tag=mongoose.model("tag",tagSchema);

