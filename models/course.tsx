import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, default: "" },
    color: { type: String, default: "#2563EB" },
  },
  {
    timestamps: { createdAt: "dateCreated", updatedAt: "updatedAt" },
  }
);

const Course = mongoose.models.courses || mongoose.model("courses", courseSchema);
export default Course;
