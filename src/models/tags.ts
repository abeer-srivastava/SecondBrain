import mongoose, { mongo } from "mongoose";



const tagSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:false
    }
});

const Tag=mongoose.model("tag",tagSchema);
export default Tag
