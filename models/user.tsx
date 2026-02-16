import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String, 
            required: true, 
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: String
    }
);

export default mongoose.model("user", userSchema);