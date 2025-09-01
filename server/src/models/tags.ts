import mongoose, { mongo, Schema } from "mongoose";


const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});



export const Tag=mongoose.model("tag",tagSchema);

