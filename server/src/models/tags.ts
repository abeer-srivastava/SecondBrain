import mongoose, { Types } from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  tagId: {
    type: String,
    unique: true,
    sparse: true,
    default: function() {
      return new Types.ObjectId().toString();
    }
  }
}, {
  timestamps: true
});

// Create compound index to ensure tagId is unique when it exists
tagSchema.index({ tagId: 1 }, { unique: true, sparse: true });

export const Tag = mongoose.model("Tag", tagSchema);

