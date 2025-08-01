import express from "express";
import mongoose from "mongoose";
import ConnectDb from "./config/db.config";
import userRoute from "./routes/user.routes"
import cookieParser from "cookie-parser";
import { checkForAuthenticationCookie } from "./middlewares/auth";
import cors from "cors"
ConnectDb('mongodb://localhost:27017/second-brain')
.then(()=>console.log("MongoDB Connected"))
.catch((e)=>console.log("ERROR OCC:",e));


const app=express();
const PORT=process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(checkForAuthenticationCookie);
app.use(cors());

app.use("/api",userRoute);

app.listen(PORT,()=>{console.log("Server Started On PORT ",PORT)});
