// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in the project root
const envPath = '/home/levi1604/second_Brain/.env';
console.log('Loading .env from:', envPath);
dotenv.config({ 
  path: envPath,
  debug: true,
  override: true
});

// Debug: Log all environment variables (except sensitive ones)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : 'Not set',
  COHERE_API_KEY: process.env.COHERE_API_KEY ? '***' : 'Not set',
  QDRANT_HOST: process.env.QDRANT_HOST ? 'Set' : 'Not set',
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  // Debug info
  cwd: process.cwd()
});

import express from "express";
import ConnectDb from "./config/db.config";
import userRoute from "./routes/user.routes";
import cookieParser from "cookie-parser";
import { checkForAuthenticationCookie } from "./middlewares/auth";
import cors from "cors";

console.log('Environment variables loaded:', {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : 'Not set',
    COHERE_API_KEY: process.env.COHERE_API_KEY ? '***' : 'Not set',
    QDRANT_HOST: process.env.QDRANT_HOST ? 'Set' : 'Not set'
});
ConnectDb('mongodb://localhost:27017/second-brain')
.then(()=>console.log("MongoDB Connected"))
.catch((e)=>console.log("ERROR OCC:",e));


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



app.use("/api",userRoute);

app.listen(PORT,()=>{console.log("Server Started On PORT ",PORT)});
