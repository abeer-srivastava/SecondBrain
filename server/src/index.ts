import express from "express";
import ConnectDb from "./config/db.config";
import userRoute from "./routes/user.routes";
import cookieParser from "cookie-parser";
import { checkForAuthenticationCookie } from "./middlewares/auth";
import cors from "cors";
import dotenv from 'dotenv';
import path from 'path';

const envPath = '/home/levi1604/second_Brain/server/.env';
dotenv.config({ 
  path: envPath,
  debug: true,
  override: true
});




ConnectDb('mongodb://localhost:27017/second-brain')
.then(()=>console.log("MongoDB Connected"))
.catch((e)=>console.log("ERROR occured during DB connection:",e));


const app=express();
const PORT=process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

// CORS must be configured before authentication middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
}));

// Authentication middleware should come after CORS
app.use(checkForAuthenticationCookie);



app.get("/",(req,res)=>{
  console.log("ping");
})

app.use("/api",userRoute);

app.listen(PORT,()=>{console.log("Server Started On PORT ",PORT)});
