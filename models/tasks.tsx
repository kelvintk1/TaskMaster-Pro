import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false, // optional for now
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    priority: {
      type: Boolean,
      default: false,
    },
    remind: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
      required: false,
    },
    remindTime: {
      type: String,
      required: false,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    dueTime: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: {
      createdAt: "dateCreated",
      updatedAt: "updatedAt",
    },
  }
);

// ✅ Check if model already exists to avoid OverwriteModelError
const Tasks = mongoose.models.tasks || mongoose.model("tasks", taskSchema);

export default Tasks;