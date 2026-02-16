import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        title: {
            type: String,
            required: true
        },
        description: String,
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending"
        },
        priority: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("tasks", taskSchema);