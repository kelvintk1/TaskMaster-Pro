import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true, // Add index for better query performance
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
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ["manual", "timetable"],
      default: "manual",
    },
    courseCode: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: "dateCreated",
      updatedAt: "updatedAt",
    },
  }
);

taskSchema.index({ completed: 1, dateCreated: -1 });
taskSchema.index({ userId: 1 });

// ✅ Check if model already exists to avoid OverwriteModelError
const Tasks = mongoose.models.tasks || mongoose.model("tasks", taskSchema);

export default Tasks;