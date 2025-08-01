import mongoose from "mongoose";

const ConnectDb=async(url:string)=>{
    mongoose.connect(process.env.MONGO_URL||url);
}

export default ConnectDb;